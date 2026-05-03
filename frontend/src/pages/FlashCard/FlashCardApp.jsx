import "./main.css";
import UploadPdfModal from "../../fragments/FlashCard/PDF/UploadPdf";
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
        ADD_NEW_VALUE={fc.ADD_NEW_VALUE}
        handleSetChange={fc.handleSetChange}
        setShowForm={fc.setShowForm}
      />

      <UploadPdfModal open={fc.showUploadModal} onClose={() => fc.setShowUploadModal(false)} />

      {fc.showForm && (
        <CreateForm q={fc.q} a={fc.a} setQ={fc.setQ} setA={fc.setA} addCard={fc.addCard} />
      )}

      <Metrics known={fc.known} unknown={fc.unknown} unanswered={fc.unanswered} percent={fc.percent} />
      <ProgressBar percent={fc.percent} />

      {!fc.cards.length ? (
        <div className="state-box">
          <h3>No cards in this set.</h3>
          <button className="btn-primary" onClick={() => fc.setShowForm(true)}>Create flashcard</button>
        </div>
      ) : fc.finished ? (
        <SessionEnd
          known={fc.known} unknown={fc.unknown}
          resetSession={fc.resetSession} retryUnknownOnly={fc.retryUnknownOnly}
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
    </div>
  );
}
