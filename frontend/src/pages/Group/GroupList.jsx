import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserGroups, leave_group, create_new_group, join_group } from "../../utils/Group/group_api";
import GroupList from "../../fragments/Group/GroupList.jsx";
import Modal from "../../fragments/Modal.jsx";
import "./GroupList.css";

export default function Groups() {

    const [groups, setGroups] = useState([]);
    const [modalState, setModalState] = useState(null);
    const navigate = useNavigate();


    // Creare de grupuri
    const [newGroupName, setNewGroupName] = useState("");
    const [searchFilter, setSearchFilter] = useState("");


    useEffect(() => {
        document.body.classList.add("group-body");
        return () => {
            document.body.classList.remove("group-body");
        };
    }, []);

    async function fetchGroups() {
        const data = await getUserGroups();
        setGroups(data);
        localStorage.setItem("groups", JSON.stringify(data));
    }

    useEffect(() => {
        fetchGroups();
    }, []);


    function loadGroup(group) {
        navigate(`/group/${group.name}`);
    }

    async function leaveGroup(group) {
        const rez = await leave_group(group.id);
        if (rez.status == 200) {
            setModalState({ type: "success", message: "You left the group." });
            fetchGroups();
        } else {
            setModalState({ type: "error", message: "Could not leave the group. Try reloading the page first" });
        }
    }

    async function handleCreateGroup() {
        const rez = await create_new_group(newGroupName);
        if (rez.status === 201) {
            setModalState({ type: "success", message: `Group created! Share this token: ${rez.group.token}` });
            fetchGroups();
            setNewGroupName("");
        } else {
            setModalState({ type: "error", message: "Could not create the group." });
        }
    }

    async function handleJoinGroup() {
        const rez = await join_group(newGroupName);
        if (rez.status === 200) {
            setModalState({ type: "success", message: "You joined the group!" });
            fetchGroups();
            setNewGroupName("");
        } else {
            setModalState({ type: "error", message: "Could not join the group. Check the token." });
        }
    }

    // Handlers
    return (
        <>
            <div className="group-main">
                <div className="group-body-container">
                    <h1>Study Groups</h1>

                    {groups.length === 0 ? (
                        <div className="group-empty">
                            <p>Currently you are not in a group.</p>
                            <div className="group-empty-actions">
                                <button onClick={() => { setModalState({ type: "create-group" }) }}> Create a group </button>
                                <button onClick={() => { setModalState({ type: "join-group" }) }}>  Join a group </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group-content">
                            <div className="group-toolbar">
                                <input
                                    className="search-bar"
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Search groups"
                                />
                            </div>
                            <GroupList
                                groups={groups}
                                searchFilter={searchFilter}
                                loadGroup={loadGroup}
                                leaveGroup={leaveGroup}
                            />
                            <div className="group-actions">
                                <button onClick={() => { setModalState({ type: "create-group" }) }}> Create a group </button>
                                <button onClick={() => { setModalState({ type: "join-group" }) }}>  Join a group </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {modalState && modalState.type == "create-group" && (
                <Modal title="Create a new group"
                    message="Provide a name for your new group" buttons={[
                        { label: "Ok", onClick: handleCreateGroup },
                        { label: "Cancel", onClick: () => { setModalState(null) } }
                    ]}>
                    <input type={"text"} placeholder={"Group Name"} onChange={(e) => { setNewGroupName(e.target.value) }}></input>
                </Modal>)
            }

            {modalState && modalState.type == "join-group" && (
                <Modal title="Join a group"
                    message="Provide the token of the group you want to join." buttons={[
                        { label: "Ok", onClick: handleJoinGroup },
                        { label: "Cancel", onClick: () => { setModalState(null) } }
                    ]}>
                    <input type={"text"} placeholder={"Group Token"} onChange={(e) => { setNewGroupName(e.target.value) }}></input>
                </Modal>)
            }

        </>
    );

}