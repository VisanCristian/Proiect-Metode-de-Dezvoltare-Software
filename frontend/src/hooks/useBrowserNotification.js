import { useEffect, useCallback } from 'react'

export default function useBrowserNotification() {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const notify = useCallback((title, body) => {
        if (document.hidden && Notification.permission === 'granted') {
            new Notification(title, { body })
        }
    }, [])

    return { notify }
}
