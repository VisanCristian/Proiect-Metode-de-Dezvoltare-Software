import "../fragments/FileTree/Modals/Modals.css";

/**
 * Universal Modal component.
 *
 * @param {Object}  props
 * @param {string}  [props.title]           - Optional heading rendered as <h2>.
 * @param {string}  [props.message]         - Text shown as <p> below the title.
 * @param {string}  [props.loadingMessage]  - Text shown while isLoading is true.
 * @param {boolean} [props.isLoading]       - When true, only loadingMessage is rendered.
 * @param {Array}   [props.buttons]         - Array of button configs: { label, onClick, variant, disabled }.
 *                                            variant is "confirm" | "cancel" (default "confirm").
 * @param {React.ReactNode} [props.children] - Custom JSX rendered between the message and buttons.
 */
export default function Modal({
    title,
    message,
    loadingMessage = "Loading...",
    isLoading = false,
    buttons = [],
    children,
}) {
    return (
        <div className="modal-overlay">
            <div className="filetree-modal">
                {isLoading ? (
                    <p>{loadingMessage}</p>
                ) : (
                    <>
                        {title && <h2>{title}</h2>}
                        {message && <p>{message}</p>}
                        {children}
                        {buttons.length > 0 && (
                            <div className="modal-options">
                                {buttons.map((btn, index) => (
                                    <button
                                        key={index}
                                        className={btn.variant === "cancel" ? "button-cancel" : "button-confirm"}
                                        onClick={btn.onClick}
                                        disabled={btn.disabled ?? false}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
