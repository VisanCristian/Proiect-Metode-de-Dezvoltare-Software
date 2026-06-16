import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Modal from "../../fragments/Modal.jsx";
import { useFlashCards } from "../../hooks/FlashCard/useFlashCards";
import Metrics from "../../fragments/FlashCard/Metrics/Metrics";
import ProgressBar from "../../fragments/FlashCard/ProgressBar/ProgressBar";
import FlashCard from "../../fragments/FlashCard/Card/FlashCard";
import CardNav from "../../fragments/FlashCard/CardNav/CardNav";
import SessionEnd from "../../fragments/FlashCard/SessionEnd/SessionEnd";

import FileList from "../../fragments/FileTree/File/FileList.jsx";
import ViewFileScreen from "../../fragments/FileTree/Components/ViewFileScreen/ViewFileScreen.jsx";
import EditFileScreen from "../../fragments/FileTree/Components/EditFileScreen/EditFileScreen.jsx";
import { convertMarkdownFileToPdf, saveFileChanges, exportFile, getUserFolders, getFolderFiles } from "../../services/filetree_api.js";
import { getUserGroups, getGroupDetails, shareDeckToGroup, shareFileToGroup, unshareDeckFromGroup, unshareFileFromGroup, getGroupMembersStats } from "../../utils/Group/group_api";
import MarkdownRenderer from "../../fragments/MarkdownRenderer/MarkdownRenderer";
import { sendMessageToChatbot } from "../../utils/chatbot_api";

import "./Group.css";
export default function Group(group) {
    const { id: name } = useParams();
    const [currentGroup, setCurrentGroup] = useState(null);
    const [tab, setTab] = useState("Study");
    const [modalState, setModalState] = useState(null);
    const [playingDeck, setPlayingDeck] = useState(false);
    const [pageMode, setPageMode] = useState({ type: "browser" });

    const [groupDecks, setGroupDecks] = useState([]);
    const [groupFiles, setGroupFiles] = useState([]);
    const [userFiles, setUserFiles] = useState([]);
    const [userFilesLoading, setUserFilesLoading] = useState(false);

    const [deckSearch, setDeckSearch] = useState("");
    const [fileSearch, setFileSearch] = useState("");

    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatBottomRef = useRef(null);

    const [groupStats, setGroupStats] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);

    const handleChatbotSubmit = async (e) => {
        e?.preventDefault();
        const text = chatInput.trim();
        if (!text || isChatLoading) return;
        setChatMessages(prev => [...prev, { role: 'user', text }]);
        setChatInput("");
        setIsChatLoading(true);
        try {
            const responseData = await sendMessageToChatbot(text, {
                groupId: currentGroup?.id,
                availableFiles: groupFiles.map(item => item.file_details).filter(Boolean),
                availableDecks: groupDecks.map(item => item.deck_details).filter(Boolean),
            });
            const reply = typeof responseData === 'string' ? responseData :
                (responseData.output || responseData.message || responseData.text || JSON.stringify(responseData));
            setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    async function fetchGroupDetails(groupId) {
        const response = await getGroupDetails(groupId);
        if (response.status === 200) {
            setGroupDecks(response.group.shared_decks_detail || []);
            setGroupFiles(response.group.shared_files_detail || []);
        }
    }

    useEffect(() => {
        async function fetchGroupInfo() {
            const decodedName = decodeURIComponent(name);
            let storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
            let foundGroup = storedGroups.find(g => g.name === decodedName);

            if (!foundGroup) {
                storedGroups = await getUserGroups();
                localStorage.setItem("groups", JSON.stringify(storedGroups));
                foundGroup = storedGroups.find(g => g.name === decodedName);
            }

            setCurrentGroup(foundGroup || { name: decodedName, token: "Not Found" });
            if (foundGroup) {
                fetchGroupDetails(foundGroup.id);
            }
        }
        fetchGroupInfo();
    }, [name]);

    async function loadUserFiles() {
        setUserFilesLoading(true);
        try {
            const folders = await getUserFolders();
            let allFiles = [];
            for (const folder of folders) {
                const files = await getFolderFiles(folder.id);
                allFiles = [...allFiles, ...files];
            }
            setUserFiles(allFiles);
        } catch (err) {
            console.error("Failed to load user files:", err);
        } finally {
            setUserFilesLoading(false);
        }
    }

    useEffect(() => {
        if (tab === "Stats" && currentGroup?.id && groupStats.length === 0) {
            setStatsLoading(true);
            getGroupMembersStats(currentGroup.id)
                .then(({ members }) => setGroupStats(members))
                .finally(() => setStatsLoading(false));
        }
    }, [tab, currentGroup]);

    const fc = useFlashCards();

    async function handleConvertFileToPdf(file) {
        try {
            const newFile = await convertMarkdownFileToPdf(file);
            setPageMode({ type: "view-file", file: newFile });
            // TODO: If needed, refresh groupFiles here to show the new PDF
        } catch (error) {
            console.error("Could not convert markdown file to PDF:", error);
            alert(error.message || "Could not convert the markdown file to PDF.");
        }
    }

    async function handleConfirmExportFile(format) {
        if (modalState.type !== "export-file" || !modalState.file) return;
        try {
            await exportFile(modalState.file, format);
            setModalState(null);
        } catch (err) {
            console.error("Could not export file\n", err);
            alert(err.message || "Could not export this file.");
        }
    }

    function handleBackFromEdit(isChangingContent, draftContent) {
        if (isChangingContent === false) {
            setPageMode({ type: "browser" });
            return;
        }
        setModalState({ type: "save-changes", file: pageMode.file, changes: draftContent })
    }

    async function handleSaveFile(newContent) {
        try {
            await saveFileChanges(pageMode.file.id, newContent);
            alert("File saved successfully.");
            return true;
        } catch (err) {
            console.error("Changes couldn't be written to file:", err);
            alert(err.message || "Could not save the file changes.");
            return false;
        }
    }

    async function handleConfirmSaveFile() {
        if (modalState.type !== "save-changes" || !modalState.file) return;
        try {
            await saveFileChanges(pageMode.file.id, modalState.changes);
            setModalState(null);
            setPageMode({ type: "browser" });
        } catch (error) {
            console.error("Changes couldn't be written to file:", error);
            alert(error.message || "Could not save the file changes.");
        }
    }

    return (
        <>
            {currentGroup && (
                <div className="group-header-container">
                    <h1 className="group-page-title">{currentGroup.name}</h1>
                    <div className="group-token-small-box">
                        <span>Token: <strong>{currentGroup.token}</strong></span>
                        <button className="copy-token-btn" onClick={() => {
                            navigator.clipboard.writeText(currentGroup.token);
                        }} title="Copy Token">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <div className="group-page">
                <nav>
                    <ul>
                        <li><button onClick={() => { setTab("Study") }}>Study</button></li>
                        <li><button onClick={() => { setTab("Chatbot") }}>Chatbot</button></li>
                        <li><button onClick={() => { setTab("Stats") }}>Stats</button></li>
                    </ul>
                </nav>
                <div className={"tab-" + tab}>
                    {tab === "Study" && (
                        <>

                            <div className="Flashcards">
                                <div className="group-section-header">
                                    <span>Group Flashcard Decks</span>
                                    <button onClick={() => { setModalState({ type: "add-deck-to-group" }) }}>Add Deck</button>
                                </div>

                                <input
                                    type="text"
                                    className="search-bar"
                                    placeholder="Search Decks..."
                                    value={deckSearch}
                                    onChange={(e) => setDeckSearch(e.target.value)}
                                />

                                {groupDecks.length === 0 ? (
                                    <p>Loading or no decks available...</p>
                                ) : (
                                    <div className="deck-list">
                                        {groupDecks
                                            .filter(item => item.deck_details?.title?.toLowerCase().includes(deckSearch.toLowerCase()))
                                            .map(item => (
                                                <div
                                                    key={item.deck}
                                                    className="group-deck-item"
                                                    onClick={() => {
                                                        fc.setSetId(item.deck);
                                                        setPlayingDeck(true);
                                                    }}
                                                >
                                                    <h4>{item.deck_details?.title} {item.owner && <span className="owner-badge">(Owner)</span>}</h4>
                                                    <p className="card-count">{item.deck_details?.cards?.length || 0} cards</p>
                                                    {item.owner && (
                                                        <button className="button-remove-deck" onClick={(e) => {
                                                            e.stopPropagation();
                                                            unshareDeckFromGroup(currentGroup.id, item.deck).then(() => {
                                                                fetchGroupDetails(currentGroup.id);
                                                            });
                                                        }}>Remove</button>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="Files" >
                                <div className="group-section-header">
                                    <span>Group Files</span>
                                    <button onClick={() => { setModalState({ type: "add-file-to-group" }) }}>Add File</button>
                                </div>

                                {pageMode.type === "view-file" ? (
                                    <ViewFileScreen
                                        file={pageMode.file}
                                        onBack={() => setPageMode({ type: "browser" })}
                                        onExport={() => setModalState({ type: "export-file", file: pageMode.file })}
                                        onConvertToPdf={handleConvertFileToPdf}
                                    />
                                ) : pageMode.type === "edit-file" ? (
                                    <EditFileScreen
                                        file={pageMode.file}
                                        onBack={handleBackFromEdit}
                                        onSave={handleSaveFile}
                                        onConvertToPdf={handleConvertFileToPdf}
                                    />
                                ) : (
                                    <>
                                        <div className="group-files-container">
                                            {groupFiles.length === 0 ? (
                                                <p>No files available...</p>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="search-bar"
                                                        placeholder="Search Files..."
                                                        value={fileSearch}
                                                        onChange={(e) => setFileSearch(e.target.value)}
                                                    />
                                                    <div className="file-list-container">
                                                        <FileList
                                                            files={groupFiles.map(item => ({ ...item.file_details, isOwner: item.owner }))}
                                                            selectedFolder={true} /* bypass selectedFolder check */
                                                            filesLoading={false}
                                                            onView={(file) => setPageMode({ type: "view-file", file })}
                                                            onEdit={(file) => setPageMode({ type: "edit-file", file })}
                                                            onRemove={(file) => {
                                                                unshareFileFromGroup(currentGroup.id, file.id).then(() => {
                                                                    fetchGroupDetails(currentGroup.id);
                                                                });
                                                            }}
                                                            searchFilter={fileSearch}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    {tab === "Chatbot" && (
                        <div className="group-chatbot-wrapper">
                            <div className="chatbot-panel__header">
                                <div className="chatbot-panel__header-left">
                                    <span className="chatbot-panel__title">Group Assistant</span>
                                    <span className="chatbot-panel__model">Auto</span>
                                </div>
                                <span className="chatbot-panel__tokens">Group context only</span>
                            </div>

                            <div className="chatbot-panel__messages group-chatbot__messages">
                                {chatMessages.length === 0 && (
                                    <div className="chatbot-panel__empty">
                                        <div className="chatbot-panel__empty-icon">💬</div>
                                        <p className="chatbot-panel__empty-title">Group Assistant</p>
                                        <p className="chatbot-panel__empty-hint">Ask anything about this group's files or flashcard decks.</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`chatbot-panel__bubble chatbot-panel__bubble--${msg.role}`}
                                    >
                                        {msg.text}
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="chatbot-panel__bubble chatbot-panel__bubble--assistant chatbot-panel__thinking">
                                        Thinking...
                                    </div>
                                )}
                                <div ref={chatBottomRef} />
                            </div>

                            <div className="chatbot-panel__input-row">
                                <textarea
                                    className="chatbot-panel__input"
                                    placeholder="Ask about group files or decks..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatbotSubmit(); } }}
                                    rows={2}
                                    disabled={isChatLoading}
                                />
                                <button
                                    className="chatbot-panel__send"
                                    onClick={handleChatbotSubmit}
                                    aria-label="Send message"
                                    disabled={isChatLoading || !chatInput.trim()}
                                >
                                    ↑
                                </button>
                            </div>
                        </div>
                    )}
                    {tab === "Stats" && (
                        <div className="stats-tab-container">
                            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Member Activity</h2>
                            {statsLoading ? (
                                <p>Loading stats...</p>
                            ) : groupStats.length === 0 ? (
                                <p>No activity recorded yet.</p>
                            ) : (
                                groupStats.map(member => (
                                    <div key={member.user_id} className="member-stats-block">
                                        <h3 style={{ marginBottom: '0.75rem' }}>{member.username}</h3>
                                        {member.monthly.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activity yet.</p>
                                        ) : (
                                            <ul className="member-stats-list">
                                                {member.monthly.map(row => (
                                                    <li key={row.month} className="member-stats-item">
                                                        <span className="stats-month">{row.month}</span>
                                                        <span className="stats-stat">{Math.round(row.total_focus_time / 60)} min focus</span>
                                                        <span className="stats-stat">{row.total_solved_cards} cards solved</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {playingDeck && (
                    <Modal
                        title={`Playing Deck: ${groupDecks.find(item => String(item.deck.id) === String(fc.setId))?.deck.title || ''}`}
                        buttons={[{ label: "Close", onClick: () => setPlayingDeck(false) }]}
                    >
                        <div className="flash-page-modal">
                            <Metrics known={fc.known} unknown={fc.unknown} unanswered={fc.unanswered} percent={fc.percent} />
                            <ProgressBar percent={fc.percent} />

                            {!fc.cards.length ? (
                                <div className="state-box">
                                    <h3>There are no cards in this deck.</h3>
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
                                        fetchRecommendations={fc.fetchRecommendations}
                                    />
                                </>
                            )}
                        </div>
                    </Modal>
                )}

                {modalState && modalState.type === "add-deck-to-group" && (
                    <Modal
                        title="Add Deck to Group"
                        message="Select one of your personal decks to add to this group."
                        buttons={[{ label: "Cancel", onClick: () => setModalState(null) }]}
                    >
                        <div className="user-decks-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginTop: '15px' }}>
                            {fc.loading ? (
                                <p>Loading your decks...</p>
                            ) : fc.sets.length === 0 ? (
                                <p>You have no personal decks to add.</p>
                            ) : (
                                fc.sets.map(deck => (
                                    <div
                                        key={deck.id}
                                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onClick={() => {
                                            shareDeckToGroup(currentGroup.id, deck.id).then(() => {
                                                fetchGroupDetails(currentGroup.id);
                                            });
                                            setModalState(null);
                                        }}
                                    >
                                        <span>{deck.title} <strong>({deck.cards?.length || 0} cards)</strong></span>
                                        <button style={{ padding: '5px 10px' }}>Add</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Modal>
                )}

                {modalState && modalState.type === "add-file-to-group" && (
                    <Modal
                        title="Add File to Group"
                        message="Select one of your personal files to add to this group."
                        buttons={[{ label: "Cancel", onClick: () => setModalState(null) }]}
                    >
                        <div className="user-files-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginTop: '15px' }}>
                            {userFilesLoading ? (
                                <p>Loading your files...</p>
                            ) : userFiles.length === 0 ? (
                                <p>You have no personal files to add.</p>
                            ) : (
                                userFiles.map(file => (
                                    <div
                                        key={file.id}
                                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onClick={() => {
                                            shareFileToGroup(currentGroup.id, file.id).then(() => {
                                                fetchGroupDetails(currentGroup.id);
                                            });
                                            setModalState(null);
                                        }}
                                    >
                                        <span>{file.name}</span>
                                        <button style={{ padding: '5px 10px' }}>Add</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Modal>
                )}

                {modalState && modalState.type === "export-file" && (
                    <Modal
                        title="Export File"
                        buttons={[
                            { label: "Cancel", onClick: () => setModalState(null), variant: "cancel" },
                            { label: "Confirm", onClick: () => handleConfirmExportFile("text") }, // simplified for text
                        ]}
                    >
                        <p>Are you sure you want to export {modalState.file?.name}?</p>
                    </Modal>
                )}

                {modalState && modalState.type === "save-changes" && (
                    <Modal
                        message="There are unsaved changes. Do you want to save them?"
                        buttons={[
                            { label: "Don't Save", onClick: () => { setModalState(null); setPageMode({ type: "browser" }); }, variant: "cancel" },
                            { label: "Save", onClick: handleConfirmSaveFile },
                        ]}
                    />
                )}
            </div>
        </>
    );
}