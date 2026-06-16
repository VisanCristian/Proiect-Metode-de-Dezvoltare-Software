import { describe, expect, it } from 'vitest'
import { buildMessageObject, buildContextObject, buildSettingsObject, buildChatPayload } from './format'

describe('buildMessageObject', () => {
    it('returns correct structure for user message', () => {
        const result = buildMessageObject('Hello', 'user')
        expect(result.text).toBe('Hello')
        expect(result.role).toBe('user')
        expect(typeof result.timestamp).toBe('string')
    })

    it('defaults role to user', () => {
        const result = buildMessageObject('Hi')
        expect(result.role).toBe('user')
    })

    it('sets assistant role correctly', () => {
        const result = buildMessageObject('Response', 'assistant')
        expect(result.role).toBe('assistant')
    })
})

describe('buildContextObject', () => {
    it('returns personal context with correct fields', () => {
        const result = buildContextObject({
            scope: 'personal',
            userId: 42,
            availableFiles: [{ id: 1 }],
            availableDecks: [{ id: 2 }],
        })
        expect(result.scope).toBe('personal')
        expect(result.user_id).toBe(42)
        expect(result.group_id).toBeNull()
        expect(result.available_files).toHaveLength(1)
        expect(result.available_decks).toHaveLength(1)
    })

    it('returns group context with groupId', () => {
        const result = buildContextObject({
            scope: 'group',
            userId: 42,
            groupId: 7,
            availableFiles: [],
            availableDecks: [],
        })
        expect(result.scope).toBe('group')
        expect(result.group_id).toBe(7)
    })

    it('defaults availableFiles and availableDecks to empty arrays', () => {
        const result = buildContextObject({ scope: 'personal', userId: 1 })
        expect(result.available_files).toEqual([])
        expect(result.available_decks).toEqual([])
    })
})

describe('buildSettingsObject', () => {
    it('returns personal type when isGroup is false', () => {
        const result = buildSettingsObject({ model: 'Haiku', isGroup: false })
        expect(result.model).toBe('Haiku')
        expect(result.type).toBe('personal')
    })

    it('returns group type when isGroup is true', () => {
        const result = buildSettingsObject({ model: 'Haiku', isGroup: true })
        expect(result.type).toBe('group')
    })

    it('defaults isGroup to false', () => {
        const result = buildSettingsObject({ model: 'gpt-mini' })
        expect(result.type).toBe('personal')
    })
})

describe('buildChatPayload', () => {
    it('assembles all three objects into payload', () => {
        const message = buildMessageObject('test', 'user')
        const context = buildContextObject({ scope: 'personal', userId: 1 })
        const settings = buildSettingsObject({ model: 'Haiku' })

        const payload = buildChatPayload(message, context, settings)

        expect(payload.message).toBe(message)
        expect(payload.context).toBe(context)
        expect(payload.settings).toBe(settings)
    })

    it('group payload has correct scope and type', () => {
        const message = buildMessageObject('test', 'user')
        const context = buildContextObject({ scope: 'group', userId: 1, groupId: 5 })
        const settings = buildSettingsObject({ model: 'Haiku', isGroup: true })

        const payload = buildChatPayload(message, context, settings)

        expect(payload.context.scope).toBe('group')
        expect(payload.context.group_id).toBe(5)
        expect(payload.settings.type).toBe('group')
    })
})
