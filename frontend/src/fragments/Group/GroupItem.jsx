import "./GroupItem.css";

export default function GroupItem({ group, loadGroup, leaveGroup }) {
    return (
        <div className="group-item">
            <span className="group-item-icon">👥</span>
            <p className="group-item-name"> {group.name} </p>
            <div className="group-item-options">
                <button className="button-view" onClick={() => { loadGroup(group) }}>See more</button>
                <button className="button-remove" onClick={() => { leaveGroup(group) }}>Leave</button>
            </div>
        </div>
    );
}
