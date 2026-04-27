import { useEffect, useMemo, useState } from "react";
import { initialSets } from "../mockData";
import { shuffleArray } from "../utils/shuffle";

const STORAGE_KEY = "flashcards_stable_v1";
const ADD_NEW_VALUE = "__add_new__";

export function useFlashCards() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

  const [sets, setSets] = useState(saved?.sets || initialSets);
  const [setId, setSetId] = useState(saved?.setId || initialSets[0]?.id || "");
  const [prevSetId, setPrevSetId] = useState(saved?.setId || initialSets[0]?.id || "");
  const [sessionIds, setSessionIds] = useState(saved?.sessionIds || []);
  const [index, setIndex] = useState(saved?.index || 0);
  const [flipped, setFlipped] = useState(false);
  const [statusById, setStatusById] = useState(saved?.statusById || {});
  const [showForm, setShowForm] = useState(false);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [flashStatus, setFlashStatus] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const currentSet = useMemo(() => sets.find((s) => s.id === setId), [sets, setId]);
  const allCards = currentSet?.cards || [];

  useEffect(() => {
    setSessionIds(allCards.map((c) => c.id));
    setIndex(0);
    setFlipped(false);
  }, [setId]);

  const cards = useMemo(() => {
    const map = new Map(allCards.map((c) => [c.id, c]));
    return sessionIds.map((id) => map.get(id)).filter(Boolean);
  }, [allCards, sessionIds]);

  const card = cards[index];
  const status = card ? statusById[card.id] || "unanswered" : "unanswered";

  let known = 0, unknown = 0, unanswered = 0;
  for (const c of cards) {
    const st = statusById[c.id] || "unanswered";
    if (st === "known") known++;
    else if (st === "unknown") unknown++;
    else unanswered++;
  }

  const percent = cards.length ? Math.round(((known + unknown) / cards.length) * 100) : 0;
  const finished = cards.length > 0 && unanswered === 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      sets, setId, sessionIds, index, statusById 
    }));
  }, [sets, setId, sessionIds, index, statusById]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!cards.length || showForm || showUploadModal) return;
      if (e.code === "ArrowLeft") { setIndex((i) => Math.max(i - 1, 0)); setFlipped(false); }
      if (e.code === "ArrowRight") { setIndex((i) => Math.min(i + 1, cards.length - 1)); setFlipped(false); }
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cards.length, showForm, showUploadModal]);

  function prev() { setIndex((i) => Math.max(i - 1, 0)); setFlipped(false); }
  function next() { setIndex((i) => Math.min(i + 1, cards.length - 1)); setFlipped(false); }

  function mark(value) {
    if (!card || !flipped) return;
    setStatusById((old) => ({ ...old, [card.id]: value }));
    setFlashStatus(value);
    setTimeout(() => {
      setFlashStatus(null);
      if (index < cards.length - 1) setIndex((i) => i + 1);
      setFlipped(false);
    }, 700);
  }

  function resetSession() {
    const copy = { ...statusById };
    allCards.forEach((c) => { copy[c.id] = "unanswered"; });
    setStatusById(copy);
    setSessionIds(allCards.map((c) => c.id));
    setIndex(0);
    setFlipped(false);
  }

  function shuffleCards() {
    const unansweredIds = sessionIds.filter((id) => (statusById[id] || "unanswered") === "unanswered");
    if (!unansweredIds.length) return;
    setSessionIds(shuffleArray(unansweredIds));
    setIndex(0);
    setFlipped(false);
  }

  function retryUnknownOnly() {
    const unknownIds = cards.filter((c) => (statusById[c.id] || "unanswered") === "unknown").map((c) => c.id);
    if (!unknownIds.length) return;
    const reset = { ...statusById };
    unknownIds.forEach((id) => { reset[id] = "unanswered"; });
    setStatusById(reset);
    setSessionIds(unknownIds);
    setIndex(0);
    setFlipped(false);
  }

  function addCard(e) {
    e.preventDefault();
    if (!q.trim() || !a.trim()) return;
    const newCard = { id: "card-" + Date.now(), question: q.trim(), answer: a.trim() };
    setSets((oldSets) => oldSets.map((s) => (s.id === setId ? { ...s, cards: [...s.cards, newCard] } : s)));
    setSessionIds((old) => [...old, newCard.id]);
    setQ(""); setA(""); setShowForm(false);
  }

  function handleSetChange(e) {
    const value = e.target.value;
    if (value === ADD_NEW_VALUE) { setShowUploadModal(true); setSetId(prevSetId); return; }
    setPrevSetId(value); setSetId(value);
  }

  return {
    sets, setId, cards, card, index, flipped, setFlipped,
    status, flashStatus, known, unknown, unanswered, percent, finished,
    showForm, setShowForm, q, setQ, a, setA,
    showUploadModal, setShowUploadModal,
    ADD_NEW_VALUE,
    prev, next, mark, resetSession, shuffleCards, retryUnknownOnly, addCard, handleSetChange,
  };
}