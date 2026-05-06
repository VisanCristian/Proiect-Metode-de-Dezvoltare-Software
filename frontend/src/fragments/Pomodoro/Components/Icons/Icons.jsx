export function PlayIcon({ size = 20, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
            <path d="M5 3.5L16 10L5 16.5V3.5Z" />
        </svg>
    )
}

export function PauseIcon({ size = 20, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
            <path d="M5 3.5H8.5V16.5H5Z M11.5 3.5H15V16.5H11.5Z" />
        </svg>
    )
}

export function StopIcon({ size = 20, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
            <path d="M4.5 4.5H15.5V15.5H4.5Z" />
        </svg>
    )
}

export function SkipIcon({ size = 20, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" {...props}>
            <path d="M4 3.5L12 10L4 16.5V3.5Z M13 3.5H16V16.5H13Z" />
        </svg>
    )
}

export function GearIcon({ size = 20, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1.5v2M10 16.5v2M3.05 3.05l1.41 1.41M15.54 15.54l1.41 1.41M1.5 10h2M16.5 10h2M3.05 16.95l1.41-1.41M15.54 4.46l1.41-1.41" />
        </svg>
    )
}

export function CloseIcon({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
    )
}

export function DragIcon({ size = 12, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="var(--border)" {...props}>
            <circle cx="3" cy="2" r="1.2" /><circle cx="9" cy="2" r="1.2" />
            <circle cx="3" cy="6" r="1.2" /><circle cx="9" cy="6" r="1.2" />
            <circle cx="3" cy="10" r="1.2" /><circle cx="9" cy="10" r="1.2" />
        </svg>
    )
}

export function CheckIcon({ size = 14, ...props }) {
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d={size <= 10
                ? "M2 5l2 2 4-4.5"
                : "M2.5 7l3 3L11.5 4"
            } />
        </svg>
    )
}

export function TrashIcon({ size = 14, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" {...props}>
            <path d="M2.5 3.5h9M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M4.5 3.5l.5 8h4l.5-8" />
        </svg>
    )
}

export function ListIcon({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" {...props}>
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <path d="M5 8h6M5 5h6M5 11h3" />
        </svg>
    )
}

export function PlusIcon({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" {...props}>
            <path d="M8 3v10M3 8h10" />
        </svg>
    )
}

export function ClockIcon({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" {...props}>
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.5V8l2.5 1.5" />
        </svg>
    )
}

export function CalendarIcon({ size = 14, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.3" {...props}>
            <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
            <path d="M4 1v2M10 1v2M1.5 5.5h11" />
        </svg>
    )
}

export function DropIcon({ size = 14, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.3" {...props}>
            <path d="M3 10.5c0-3 2-5.5 4-7 2 1.5 4 4 4 7a4 4 0 01-8 0z" />
        </svg>
    )
}

export function StarIcon({ size = 14, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" stroke="currentColor"
            strokeWidth="0.5" {...props}>
            <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4 3.3 12.3l.7-4.1-3-2.9 4.2-.7L7 1z" />
        </svg>
    )
}

export function ChevronIcon({ size = 14, open = false, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            {...props}>
            <path d="M3 5l4 4 4-4" />
        </svg>
    )
}

export function TimerClockIcon({ size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="var(--accent)" strokeWidth="2" />
            <path d="M20 10v10l6 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export function CircleIcon({ size = 16, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" {...props}>
            <circle cx="8" cy="8" r="5" />
        </svg>
    )
}
