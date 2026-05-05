import numpy as np
from collections import defaultdict
from datetime import date, timedelta
from .models import DeckSession, Deck


DEFAULT_NR_ZILE = 90
DIFFICULTY_THRESHOLD = 0.35
SVD_ENERGY_THRESHOLD = 0.95
MIN_COMPONENTS_TO_KEEP = 3
LAPLACE_ALPHA = 1.0
LAPLACE_BETA = 2.0

RECENT_LOOKBACK_DAYS = 35
RECENT_DROP_DAY = 7
RECENT_WEIGHT_TAU_DAYS = 5.0
AFTER_7_DAYS_SHARP_DROP = 0.20
AFTER_7_TAU_DAYS = 2.5
WEEKDAY_ACTIVATION_WEIGHT = 0.70
RECENT_ACTIVATION_WEIGHT = 0.30
WEEKDAY_DECAY_PER_DAY = 0.08
MIN_SAME_WEEKDAY_MATCHES = 2

ROW_PERCENTILE_THRESHOLD = 50
COMPONENT_MIN_ABS_CONTRIB = 0.015
SIGMA_MIN_RATIO_FOR_OVERRIDE = 0.10


def difficulty_score(greseli, raspunsuri):
    return (greseli + LAPLACE_ALPHA) / max(raspunsuri + LAPLACE_BETA, 1)

def get_db_interactions():
    qs = DeckSession.objects.all().order_by('-date')
    grupe = defaultdict(list)
    for entry in qs:
        grupe[entry.date].append({
            "pachet": entry.deck_id,
            "greseli": entry.mistakes,
            "raspunsuri": entry.responses,
        })
    return grupe

def build_daily_difficulty_matrix(data, nr_zile=DEFAULT_NR_ZILE):
    tmp = {}
    for zi, pachete_zi in data.items():
        agg = defaultdict(lambda: {"greseli": 0, "raspunsuri": 0})
        for entry in pachete_zi:
            pid = entry["pachet"]
            agg[pid]["greseli"] += entry["greseli"]
            agg[pid]["raspunsuri"] += entry["raspunsuri"]
        tmp[zi] = [
            {"pachet": p, "greseli": v["greseli"], "raspunsuri": v["raspunsuri"]}
            for p, v in sorted(agg.items())
        ]

    pachete_qs = Deck.objects.all()
    pachete_list = sorted([p.id for p in pachete_qs])
    pachet_to_col = {p: idx for idx, p in enumerate(pachete_list)}
    today = date.today()
    days = [today - timedelta(days=i) for i in range(1, nr_zile + 1)]

    A_raw = np.full((len(days), len(pachete_list)), np.nan, dtype=float)

    for row_idx, zi in enumerate(days):
        for entry in tmp.get(zi, []):
            pid = entry["pachet"]
            if pid not in pachet_to_col:
                continue
            col = pachet_to_col[pid]
            A_raw[row_idx, col] = difficulty_score(entry["greseli"], entry["raspunsuri"])

    X = np.where(np.isnan(A_raw), 0.0, A_raw - DIFFICULTY_THRESHOLD)

    ultima_accesare = {}
    for zi, entries in tmp.items():
        for entry in entries:
            pid = entry["pachet"]
            ultima_accesare[pid] = max(ultima_accesare.get(pid, zi), zi)

    zile_de_la_ultima = {}
    for pid in pachete_list:
        if pid in ultima_accesare:
            zile_de_la_ultima[pid] = max((today - ultima_accesare[pid]).days, 0)
        else:
            zile_de_la_ultima[pid] = nr_zile

    return A_raw, X, pachete_list, days, zile_de_la_ultima

def select_k_by_energy(singular_values, energy_threshold=SVD_ENERGY_THRESHOLD):
    energies = np.array(singular_values, dtype=float) ** 2
    total = energies.sum()
    if total <= 1e-12:
        return 1, np.zeros_like(energies), np.zeros_like(energies)
    cumulative = np.cumsum(energies) / total
    k_energy = int(np.searchsorted(cumulative, energy_threshold)) + 1
    max_k = len(singular_values)
    k = min(max(k_energy, min(MIN_COMPONENTS_TO_KEEP, max_k)), max_k)
    return k, energies / total, cumulative

def recency_weight(age_days):
    age = max(float(age_days), 0.0)
    if age <= RECENT_DROP_DAY:
        return float(np.exp(-age / RECENT_WEIGHT_TAU_DAYS))
    weight_at_drop = np.exp(-RECENT_DROP_DAY / RECENT_WEIGHT_TAU_DAYS)
    return float(weight_at_drop * AFTER_7_DAYS_SHARP_DROP * np.exp(-(age - RECENT_DROP_DAY) / AFTER_7_TAU_DAYS))

def normalize_weights(raw_weights):
    raw_weights = np.array(raw_weights, dtype=float)
    if len(raw_weights) == 0:
        return raw_weights
    total = raw_weights.sum()
    if total <= 1e-12:
        return np.ones_like(raw_weights) / len(raw_weights)
    return raw_weights / total

def active_recent_rows_and_weights(X, days, target_day=None, lookback_days=RECENT_LOOKBACK_DAYS):
    if target_day is None:
        target_day = date.today()
    rows = []
    raw_weights = []
    for idx, zi in enumerate(days):
        age = (target_day - zi).days
        if age <= 0 or age > lookback_days:
            continue
        if np.any(np.abs(X[idx, :]) > 1e-12):
            rows.append(idx)
            raw_weights.append(recency_weight(age))
    weights = normalize_weights(raw_weights)
    return rows, np.array(raw_weights, dtype=float), weights

def same_weekday_rows_and_weights(X, days, target_day=None, min_matches=MIN_SAME_WEEKDAY_MATCHES):
    if target_day is None:
        target_day = date.today()
    target_weekday = target_day.weekday()
    rows = []
    raw_weights = []
    for idx, zi in enumerate(days):
        age = (target_day - zi).days
        if age <= 0:
            continue
        if zi.weekday() != target_weekday:
            continue
        if np.any(np.abs(X[idx, :]) > 1e-12):
            rows.append(idx)
            raw_weights.append(float(np.exp(-WEEKDAY_DECAY_PER_DAY * age)))

    if len(rows) < min_matches:
        return [], np.array([]), np.array([])

    weights = normalize_weights(raw_weights)
    return rows, np.array(raw_weights, dtype=float), weights

def make_u_today(U_k, X, days, target_day=None):
    if target_day is None:
        target_day = date.today()

    recent_rows, recent_raw_weights, recent_weights = active_recent_rows_and_weights(X, days, target_day)
    if recent_rows:
        u_recent = recent_weights @ U_k[recent_rows, :]
    else:
        u_recent = np.zeros(U_k.shape[1])

    weekday_rows, weekday_raw_weights, weekday_weights = same_weekday_rows_and_weights(X, days, target_day)
    if weekday_rows:
        u_weekday = weekday_weights @ U_k[weekday_rows, :]
        activation = WEEKDAY_ACTIVATION_WEIGHT * u_weekday + RECENT_ACTIVATION_WEIGHT * u_recent
    else:
        activation = u_recent

    return activation

def fit_svd_pattern_model(X, days, target_day=None):
    if X.size == 0 or np.all(X == 0):
        return None

    U, s, Vt = np.linalg.svd(X, full_matrices=False)
    
    k, energy_ratio, cumulative_energy = select_k_by_energy(s)

    U_k = U[:, :k]
    s_k = s[:k]
    Vt_k = Vt[:k, :]

    activation = make_u_today(U_k, X, days, target_day=target_day)

    component_contribs = (activation[:, None] * s_k[:, None]) * Vt_k
    today_centered = component_contribs.sum(axis=0)
    today_difficulty = np.clip(today_centered + DIFFICULTY_THRESHOLD, 0.0, 1.0)

    row_median = float(np.percentile(today_centered, ROW_PERCENTILE_THRESHOLD))
    decision_threshold = max(0.0, row_median)

    return {
        "s": s,
        "s_k": s_k,
        "activation": activation,
        "component_contribs": component_contribs,
        "today_centered": today_centered,
        "today_difficulty": today_difficulty,
        "decision_threshold": decision_threshold,
    }

def classify_packages(fit, pachete_list, zile_de_la_ultima, A_raw):
    if fit is None:
        return []

    contribs = fit["component_contribs"]
    s_k = fit["s_k"]
    today_centered = fit["today_centered"]
    decision_threshold = fit["decision_threshold"]
    sigma_1 = max(float(fit["s"][0]), 1e-12)

    rows = []
    for j, pid in enumerate(pachete_list):
        c = contribs[:, j]
        positives = np.maximum(c, 0.0)
        negatives = np.maximum(-c, 0.0)
        best_pos_idx = int(np.argmax(positives)) if len(positives) else -1
        best_positive = float(positives[best_pos_idx]) if best_pos_idx >= 0 else 0.0
        best_negative = float(negatives[int(np.argmax(negatives))]) if len(negatives) else 0.0
        
        sigma_ratio_best_pos = float(s_k[best_pos_idx] / sigma_1) if best_pos_idx >= 0 and best_positive > 0 else 0.0

        passes_row_threshold = float(today_centered[j]) > decision_threshold
        positive_dominates = best_positive > best_negative
        sigma_relevant = sigma_ratio_best_pos >= SIGMA_MIN_RATIO_FOR_OVERRIDE
        recommended = passes_row_threshold and positive_dominates and sigma_relevant

        if recommended:
            rows.append(pid)

    return rows

def get_recommendations_list():
    data = get_db_interactions()
    A_raw, X, pachete_list, days, zile_de_la_ultima = build_daily_difficulty_matrix(data)
    fit = fit_svd_pattern_model(X, days)
    if fit is None:
        return []
    
    recommended_ids = classify_packages(fit, pachete_list, zile_de_la_ultima, A_raw)
    return recommended_ids
