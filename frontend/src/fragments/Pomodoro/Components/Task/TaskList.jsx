import { useState } from 'react'
import TaskItem from './TaskItem'
import { ListIcon, PlusIcon } from '../Icons/Icons'
import './Task.css'

function TaskList({ tasks, activeTaskId, onTasksChange, onSelectTask }) {
    const [newTitle, setNewTitle] = useState('')
    const [newEstimate, setNewEstimate] = useState(1)
    const [draggedId, setDraggedId] = useState(null)

    const addTask = () => {
        if (!newTitle.trim()) return
        const newTask = {
            id: crypto.randomUUID(),
            title: newTitle.trim(),
            estimatedPomodoros: newEstimate,
            actualPomodoros: 0,
            completed: false,
            order: tasks.length,
        }
        onTasksChange([...tasks, newTask])
        setNewTitle('')
        setNewEstimate(1)
    }

    const toggleTask = (id) => {
        onTasksChange(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ))
    }

    const deleteTask = (id) => {
        onTasksChange(tasks.filter(t => t.id !== id))
    }

    const handleDragStart = (e, id) => {
        setDraggedId(id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => e.preventDefault()

    const handleDrop = (e, targetId) => {
        e.preventDefault()
        if (!draggedId || draggedId === targetId) return
        const dragIndex = tasks.findIndex(t => t.id === draggedId)
        const targetIndex = tasks.findIndex(t => t.id === targetId)
        const reordered = [...tasks]
        const [moved] = reordered.splice(dragIndex, 1)
        reordered.splice(targetIndex, 0, moved)
        onTasksChange(reordered.map((t, i) => ({ ...t, order: i })))
        setDraggedId(null)
    }

    return (
        <div className="task-section">
            <h3 className="task-header">
                <ListIcon stroke="var(--accent)" />
                Tasks
            </h3>

            <div className="task-form">
                <input type="text" placeholder="Add a task..." value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    className="task-input" />
                <input type="number" min="1" max="20" value={newEstimate}
                    onChange={(e) => setNewEstimate(Number(e.target.value))}
                    title="Estimated pomodoros" className="task-estimate" />
                <button onClick={addTask} className="task-add-btn" aria-label="Add task">
                    <PlusIcon />
                </button>
            </div>

            {tasks.length === 0 ? (
                <p className="task-empty">No tasks added</p>
            ) : (
                tasks.map(task => (
                    <TaskItem key={task.id} task={task}
                        isActive={task.id === activeTaskId}
                        onSelect={onSelectTask} onToggle={toggleTask}
                        onDelete={deleteTask} onDragStart={handleDragStart}
                        onDragOver={handleDragOver} onDrop={handleDrop} />
                ))
            )}
        </div>
    )
}

export default TaskList
