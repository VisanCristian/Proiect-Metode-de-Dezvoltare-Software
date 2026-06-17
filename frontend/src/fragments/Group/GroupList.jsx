import GroupItem from "./GroupItem.jsx";

export default function GroupList({ groups, searchFilter, loadGroup, leaveGroup, isLoading }) {
    const filtered = groups.filter((group) => (group.name || '').toLowerCase().includes((searchFilter || '').toLowerCase()));
    return (
        <section>
            {isLoading ? (
                <p>Loading groups....</p>
            ) : filtered.length === 0 ? (
                <p>{groups.length === 0 ? 'No groups yet.' : 'No groups match your search.'}</p>
            ) : (
                <ul>
                    {filtered.map((group) => (
                        <li key={group.id}>
                            <GroupItem group={group} loadGroup={loadGroup} leaveGroup={leaveGroup} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
