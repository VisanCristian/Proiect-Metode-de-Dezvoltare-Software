import { useEffect } from 'react'

export default function useBeforeUnload(active) {
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            e.returnValue = ''
        }
        if (active) {
            window.addEventListener('beforeunload', handler)
        }
        return () => window.removeEventListener('beforeunload', handler)
    }, [active])
}
