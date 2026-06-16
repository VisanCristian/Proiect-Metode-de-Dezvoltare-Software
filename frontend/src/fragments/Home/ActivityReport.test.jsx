import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ActivityReport from './ActivityReport'

vi.mock('../../services/activity_api', () => ({
    getUserActivity: vi.fn(),
}))

import { getUserActivity } from '../../services/activity_api'

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe('ActivityReport', () => {
    it('shows loading state initially', () => {
        getUserActivity.mockReturnValue(new Promise(() => {}))

        render(<ActivityReport />)

        expect(screen.getByText('Loading activity...')).toBeInTheDocument()
    })

    it('shows empty message when no activity returned', async () => {
        getUserActivity.mockResolvedValue({ months: [] })

        render(<ActivityReport />)

        expect(await screen.findByText('No activity recorded yet.')).toBeInTheDocument()
    })

    it('renders monthly rows with focus time and solved cards', async () => {
        getUserActivity.mockResolvedValue({ months: [
            { month: '2026-03', total_focus_time: 3600, total_solved_cards: 40, flashcard_points: 5, tokens: 18000 },
            { month: '2026-04', total_focus_time: 1800, total_solved_cards: 20, flashcard_points: 2, tokens: 3600 },
        ] })

        render(<ActivityReport />)

        expect(await screen.findByText('2026-03')).toBeInTheDocument()
        expect(screen.getByText(/60 min focus/)).toBeInTheDocument()
        expect(screen.getByText(/40 cards/)).toBeInTheDocument()

        expect(screen.getByText('2026-04')).toBeInTheDocument()
        expect(screen.getByText(/30 min focus/)).toBeInTheDocument()
        expect(screen.getByText(/20 cards/)).toBeInTheDocument()
        expect(screen.getByText(/5 pts/)).toBeInTheDocument()
        expect(screen.getByText(/18000 tokens/)).toBeInTheDocument()
    })

    it('shows error message when the request fails', async () => {
        getUserActivity.mockRejectedValue(new Error('Could not load your activity report.'))

        render(<ActivityReport />)

        expect(
            await screen.findByText('Could not load your activity report.')
        ).toBeInTheDocument()
    })

    it('renders title "My Activity" in personal mode', async () => {
        getUserActivity.mockResolvedValue({ months: [] })

        render(<ActivityReport mode="personal" />)

        expect(await screen.findByText('My Activity')).toBeInTheDocument()
    })

    it('renders title "Group Activity" in grup mode', async () => {
        getUserActivity.mockResolvedValue({ months: [] })

        render(<ActivityReport mode="grup" />)

        expect(await screen.findByText('Group Activity')).toBeInTheDocument()
    })
})
