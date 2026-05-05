import "./main.css";
import CreateDeckModal from "../../fragments/FlashCard/Form/CreateDeckModal";
import RecommendationsPopup from "../../fragments/FlashCard/Recommendations/RecommendationsPopup";
import { useFlashCards } from "../../hooks/FlashCard/useFlashCards";
import TopBar from "../../fragments/FlashCard/TopBar/TopBar";
import CreateForm from "../../fragments/FlashCard/Form/CreateForm";
import Metrics from "../../fragments/FlashCard/Metrics/Metrics";
import ProgressBar from "../../fragments/FlashCard/ProgressBar/ProgressBar";
import FlashCard from "../../fragments/FlashCard/Card/FlashCard";
import CardNav from "../../fragments/FlashCard/CardNav/CardNav";
import SessionEnd from "../../fragments/FlashCard/SessionEnd/SessionEnd";

export default function FlashCardApp() {
  const fc = useFlashCards();

  if (fc.loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white'}}>
        <h2>Loading flashcard sets...</h2>
      </div>
    );
  }
  

  return (
    <div className="flash-page">
      <TopBar
        sets={fc.sets} setId={fc.setId} showForm={fc.showForm}
        handleSetChange={fc.handleSetChange}
        setShowForm={fc.setShowForm}
        setShowUploadModal={fc.setShowUploadModal}
      />

      <CreateDeckModal 
        open={fc.showUploadModal} 
        onClose={() => fc.setShowUploadModal(false)} 
        createDeck={fc.createDeck}
      />

      <RecommendationsPopup
        open={fc.showRecommendations}
        onClose={() => fc.setShowRecommendations(false)}
        recommendedDecks={fc.recommendedDecks}
        onSelectDeck={(id) => {
          fc.setSetId(id);
          fc.setShowRecommendations(false);
          // Actualizăm listă eliminând pachetul ales (dacă dorim din UI imediat)
          fc.setRecommendedDecks(old => old.filter(d => d.id !== id));
        }}
      />

      {fc.showForm && (
        <CreateForm q={fc.q} a={fc.a} setQ={fc.setQ} setA={fc.setA} addCard={fc.addCard} />
      )}

      <Metrics known={fc.known} unknown={fc.unknown} unanswered={fc.unanswered} percent={fc.percent} />
      <ProgressBar percent={fc.percent} />

      {!fc.cards.length ? (
        <div className="state-box">
          <h3>There are no cards in this deck.</h3>
          <button className="btn-primary" onClick={() => fc.setShowForm(true)}>Create card</button>
        </div>
      ) : fc.finished ? (
        <SessionEnd
          known={fc.known} unknown={fc.unknown}
          resetSession={fc.resetSession} retryUnknownOnly={fc.retryUnknownOnly}
          saveSessionStats={fc.saveSessionStats}
        />
      ) : (
        <>
          <FlashCard
            card={fc.card} flipped={fc.flipped} setFlipped={fc.setFlipped}
            status={fc.status} flashStatus={fc.flashStatus} mark={fc.mark}
          />
          <CardNav
            index={fc.index} cards={fc.cards}
            prev={fc.prev} next={fc.next} shuffleCards={fc.shuffleCards}
          />
        </>
      )}

      {/* Buton fix jos pentru Recomandari */}
      <button 
        onClick={fc.fetchRecommendations}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: '50px',
          backgroundColor: 'var(--accent)',
          color: 'var(--bg)',
          fontWeight: 'bold',
          border: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '1rem',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateX(-50%) scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'translateX(-50%) scale(1)'}
      >
        Recommendations
      </button>

    </div>
  );
}
