import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChatbotPanel from './ChatbotPanel'

vi.mock('../../services/chatbot_api', () => ({
    sendChatMessage: vi.fn(),
}))

import { sendChatMessage } from '../../services/chatbot_api'

beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe('ChatbotPanel', () => {
    it('renders open by default with header info', () => {
        render(<ChatbotPanel model="Haiku" tokensLeft={150} />)

        expect(screen.getByText('Haiku')).toBeInTheDocument()
        expect(screen.getByText('150 tokens')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })

    it('closes and opens on toggle button click', () => {
        render(<ChatbotPanel />)

        const toggle = screen.getByRole('button', { name: 'Close chatbot' })
        fireEvent.click(toggle)

        expect(screen.queryByPlaceholderText('Type a message...')).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Open chatbot' }))
        expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })

    it('does not send empty message', async () => {
        render(<ChatbotPanel />)

        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        expect(sendChatMessage).not.toHaveBeenCalled()
    })

    it('adds user message to list and calls sendChatMessage', async () => {
        sendChatMessage.mockResolvedValue({ message: 'Mock reply' })

        render(<ChatbotPanel />)

        fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
            target: { value: 'What is entropy?' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        expect(screen.getByText('What is entropy?')).toBeInTheDocument()
        expect(await screen.findByText('Mock reply')).toBeInTheDocument()
    })

    it('clears input after sending', async () => {
        sendChatMessage.mockResolvedValue({ message: 'ok' })

        render(<ChatbotPanel />)

        const input = screen.getByPlaceholderText('Type a message...')
        fireEvent.change(input, { target: { value: 'hello' } })
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        expect(input.value).toBe('')
    })

    it('shows error message when sendChatMessage throws', async () => {
        sendChatMessage.mockRejectedValue(new Error('Network error'))

        render(<ChatbotPanel />)

        fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
            target: { value: 'test' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        expect(await screen.findByText('Error: Network error')).toBeInTheDocument()
    })

    it('disables send button and shows warning for long messages', () => {
        render(<ChatbotPanel />)

        const longText = 'a'.repeat(1001)
        fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
            target: { value: longText },
        })

        expect(screen.getByText(/Message too long/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    })

    it('sends with personal scope by default', async () => {
        sendChatMessage.mockResolvedValue({ message: 'ok' })

        render(<ChatbotPanel scope="personal" />)

        fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
            target: { value: 'hello' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        await waitFor(() => {
            const payload = sendChatMessage.mock.calls[0][0]
            expect(payload.context.scope).toBe('personal')
            expect(payload.settings.type).toBe('personal')
        })
    })

    it('sends with group scope when prop is group', async () => {
        sendChatMessage.mockResolvedValue({ message: 'ok' })

        render(<ChatbotPanel scope="group" groupId={3} />)

        fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
            target: { value: 'hello' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        await waitFor(() => {
            const payload = sendChatMessage.mock.calls[0][0]
            expect(payload.context.scope).toBe('group')
            expect(payload.context.group_id).toBe(3)
            expect(payload.settings.type).toBe('group')
        })
    })
})
