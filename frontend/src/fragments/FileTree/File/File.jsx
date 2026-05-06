import "./File.css";
export default function File({ file, onRemove, onView, onEdit }) {
    return (
        <>
            <div className="file">
                <img className="file-icon" src={new URL(`../../assets/${file.type}.png`, import.meta.url).href} alt="Nu am gasit imaginea" />
                <p className="file-name"> {file.name} </p>
                <div className="file-options">
                    <button className="button-view" onClick={() => onView(file)}>View</button>
                    <button className="button-edit" onClick={() => onEdit(file)}>Edit</button>
                    <button className="button-remove" onClick={() => onRemove(file)}>Remove</button>
                </div>
            </div >
        </>
    );
}
