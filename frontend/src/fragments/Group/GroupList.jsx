import GroupItem from "./GroupItem.jsx";

export default function GroupList({ groups, searchFilter, loadGroup, leaveGroup, isLoading }) {
    return (
        <section>
            {isLoading ? (
                <p>Loading groups....</p>
            ) : groups.length === 0 ? (
                <p>No groups match your search.</p>
            ) : (
                <ul>
                    {groups
                        .filter((group) => group.name.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((group) => (
                            <li key={group.id}>
                                <GroupItem group={group} loadGroup={loadGroup} leaveGroup={leaveGroup} />
                            </li>
                        ))}
                </ul>
            )}
        </section>
    );
}
