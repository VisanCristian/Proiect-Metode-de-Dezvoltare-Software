export function buildMessageObject(text, role = 'user') {
    return {
        text,
        role,
        timestamp: new Date().toISOString(),
    };
}

export function buildContextObject({ scope, userId, groupId = null, availableFiles = [], availableDecks = [] }) {
    return {
        scope,
        user_id: userId,
        group_id: groupId,
        available_files: availableFiles,
        available_decks: availableDecks,
    };
}
