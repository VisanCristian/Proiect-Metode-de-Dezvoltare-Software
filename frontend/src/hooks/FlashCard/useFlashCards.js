import { addFlashcardPoints } from '../../services/agents_api';
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { shuffleArray } from "../../utils/FlashCard/shuffle";

const STORAGE_KEY = "flashcards_stable_v1";
const ADD_NEW_VALUE = "__add_new__";

function getAuthConfig() {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Token ${token}` } } : {};
}

export function useFlashCards() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

  const [sets, setSets] = useState(saved?.sets || []);
  const [loading, setLoading] = useState(true);

  const [setId, setSetId] = useState(saved?.setId || "");
  const [prevSetId, setPrevSetId] = useState(saved?.setId || "");
  
  const [sessionIds, setSessionIds] = useState(saved?.sessionIds || []);
  const [index, setIndex] = useState(saved?.index || 0);
  const [flipped, setFlipped] = useState(false);
  
  // Progresul rămâne local momentan, deoarece backend-ul necesită un User logat
  const [statusById, setStatusById] = useState(saved?.statusById || {});
  
  const [showForm, setShowForm] = useState(false);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [flashStatus, setFlashStatus] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 1. Aducem seturile de la backend. Datorită modificării din Django, 
  // response.data conține acum și cardurile imbricate direct în set!
  useEffect(() => {
    axios.get("http://127.0.0.1:8080/api/flashcards/decks/", getAuthConfig())
      .then((response) => {
        const fetchedDecks = response.data;
        setSets(fetchedDecks);
        
        if (fetchedDecks.length > 0 && (!setId || !fetchedDecks.find(s => String(s.id) === String(setId)))) {
           setSetId(fetchedDecks[0].id);
           setPrevSetId(fetchedDecks[0].id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Eroare la aducerea seturilor din backend:", error);
        setLoading(false);
      });
  }, []); // Rulează o singură dată la montare

  // 2. Extragem cardurile din setul selectat, FĂRĂ a mai face un request separat
  const currentSet = useMemo(() => sets.find((s) => String(s.id) === String(setId)), [sets, setId]);
  const allCards = currentSet?.cards || [];

  // 3. Resetăm sesiunea când se schimbă setul
  useEffect(() => {
    if(allCards.length > 0) {
      setSessionIds(allCards.map((c) => c.id));
      setIndex(0); 
      setFlipped(false);
    } else {
      setSessionIds([]); // Dacă setul e gol, curățăm ecranul
    }
  }, [setId, allCards]);

  const cards = useMemo(() => {
    const map = new Map(allCards.map((c) => [c.id, c]));
    return sessionIds.map((id) => map.get(id)).filter(Boolean);
  }, [allCards, sessionIds]);

  const card = cards[index];
  const status = card ? statusById[card.id] || "unanswered" : "unanswered";

  let known = 0, unknown = 0, unanswered = 0;
  for (const c of allCards) {
    const st = statusById[c.id] || "unanswered";
    if (st === "known") known++;
    else if (st === "unknown") unknown++;
    else unanswered++;
  }

  const percent = allCards.length ? Math.round(((known + unknown) / allCards.length) * 100) : 0;
  const finished = allCards.length > 0 && unanswered === 0;

  // Salvăm strict progresul local (localStorage) până implementezi login-ul
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      sets, setId, sessionIds, index, statusById 
    }));
  }, [sets, setId, sessionIds, index, statusById]);

  useEffect(() => {
    function onKeyDown(e) {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
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
    if (value === 'known') addFlashcardPoints(1).catch(() => {});
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
    const unknownIds = allCards.filter((c) => (statusById[c.id] || "unanswered") === "unknown").map((c) => c.id);
    if (!unknownIds.length) return;
    const reset = { ...statusById };
    unknownIds.forEach((id) => { reset[id] = "unanswered"; });
    setStatusById(reset);
    setSessionIds(unknownIds);
    setIndex(0);
    setFlipped(false);
  }

  // 4. Modificăm salvarea cardurilor noi ca să meargă spre Backend
  function addCard(e) {
    e.preventDefault();
    if (!setId) {
      alert("Vă rugăm să creați sau să selectați un pachet mai întâi!");
      return;
    }
    if (!q.trim() || !a.trim()) return;

    
    const newCardData = { 
        deck: setId, 
        question: q.trim(), 
        answer: a.trim() 
    };

    // Trimitem POST request; modelul Flashcard nu necesită User, deci va funcționa
    axios.post("http://127.0.0.1:8080/api/flashcards/cards/", newCardData, getAuthConfig())
        .then((response) => {
            const savedCard = response.data;
            setSets((oldSets) => oldSets.map((s) => (String(s.id) === String(setId) ? { ...s, cards: [...(s.cards || []), savedCard] } : s)));
            setSessionIds((old) => [...old, savedCard.id]);
            setQ(""); setA(""); setShowForm(false);
        })
        .catch((error) => console.error("Eroare la adăugarea cardului în baza de date:", error));
  }

  function createDeck(title) {
    const newDeckData = { title: title };
    axios.post("http://127.0.0.1:8080/api/flashcards/decks/", newDeckData, getAuthConfig())
        .then((response) => {
            const savedDeck = response.data;
            setSets((oldSets) => [...oldSets, savedDeck]);
            setSetId(savedDeck.id);
            setPrevSetId(savedDeck.id);
            setShowUploadModal(false); // Refolosim aceasta stare pt noul modal
        })
        .catch((error) => console.error("Eroare la crearea pachetului:", error));
  }

  function saveSessionStats() {
    if (!setId) return;
    const sessionData = {
      deck: setId,
      mistakes: unknown,
      responses: known + unknown,
    };
    axios.post("http://127.0.0.1:8080/api/flashcards/sessions/", sessionData, getAuthConfig())
        .then(() => console.log("Sesiune salvată cu succes!"))
        .catch((error) => console.error("Eroare la salvarea sesiunii:", error));
  }

  const [recommendedDecks, setRecommendedDecks] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  function fetchRecommendations() {
    axios.get("http://127.0.0.1:8080/api/flashcards/recommendations/", getAuthConfig())
        .then((response) => {
            setRecommendedDecks(response.data);
            setShowRecommendations(true);
        })
        .catch((error) => console.error("Eroare la preluarea recomandarilor:", error));
  }


  function handleSetChange(e) {
    const value = e.target.value;
    if (value === ADD_NEW_VALUE) { setShowUploadModal(true); setSetId(prevSetId); return; }
    setPrevSetId(value); setSetId(value);
  }

  return {
    sets, setSets, setId, setSetId, cards, card, index, flipped, setFlipped,
    status, flashStatus, known, unknown, unanswered, percent, finished,
    showForm, setShowForm, q, setQ, a, setA,
    showUploadModal, setShowUploadModal,
    ADD_NEW_VALUE, loading,
    recommendedDecks, showRecommendations, setShowRecommendations, setRecommendedDecks,
    prev, next, mark, resetSession, shuffleCards, retryUnknownOnly, addCard, handleSetChange, createDeck, saveSessionStats, fetchRecommendations
  };
}
