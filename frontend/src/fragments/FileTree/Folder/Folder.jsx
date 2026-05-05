import "./Folder.css";


export default function Folder({ folder, onClick }) {

    return (
        <>
            <div className="folder" onClick={onClick}>
                <img className="folder-icon" src={new URL(`../../../assets/img/folder.svg`, import.meta.url).href} alt="nu" />
                <p className="folder-name"> {folder.name} </p>
            </div>
        </>
    );
}
