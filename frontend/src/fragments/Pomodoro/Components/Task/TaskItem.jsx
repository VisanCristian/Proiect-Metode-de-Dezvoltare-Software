import { DragIcon, CheckIcon, TrashIcon } from '../Icons/Icons'

function TaskItem({ task, isActive, onSelect, onToggle, onDelete, onDragStart, onDragOver, onDrop }) {
    return (
        <div
            draggable="true"
            onDragStart={(e) => onDragStart(e, task.id)}
            onDragOver={(e) => { e.preventDefault(); onDragOver(e, task.id) }}
            onDrop={(e) => onDrop(e, task.id)}
            onClick={() => onSelect(task.id)}
            className={`task-item ${isActive ? 'task-item--active' : ''}`}
        >
            <DragIcon />

            <div
                onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}
                className={`task-checkbox ${task.completed ? 'task-checkbox--done' : ''}`}
            >
                {task.completed && <CheckIcon size={12} stroke="#fff" />}
            </div>

            <span className={`task-title ${task.completed ? 'task-title--done' : ''}`}>
                {task.title}
            </span>

            <span className={`task-progress ${task.actualPomodoros > task.estimatedPomodoros ? 'task-progress--over' : ''}`}>
                {task.actualPomodoros}/{task.estimatedPomodoros}
            </span>

            <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
                className="task-delete"
                title="Delete"
            >
                <TrashIcon />
            </button>
        </div>
    )
}

export default TaskItem
