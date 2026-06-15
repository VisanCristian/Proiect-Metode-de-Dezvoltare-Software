export function buildMessageObject(text, role = 'user') {
    return {
        text,
        role,
        timestamp: new Date().toISOString(),
    };
}
