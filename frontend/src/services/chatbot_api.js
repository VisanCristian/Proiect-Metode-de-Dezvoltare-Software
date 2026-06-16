import { sendMessageToChatbot } from '../utils/chatbot_api';

export async function sendChatMessage(payload) {
    const text = payload?.message?.text ?? '';
    const response = await sendMessageToChatbot(text);
    const replyText = typeof response === 'string'
        ? response
        : (response?.output ?? response?.message ?? response?.text ?? '');
    return { message: replyText };
}
