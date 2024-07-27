import { Conversation } from "./models";

export const persistData = (id: string, value: any) => {
    localStorage.setItem(id, JSON.stringify(value));
}

export const retrienveData = (id: string): any | null => {
    const json = localStorage.getItem(id);
    if (!json)
        return null;
    return JSON.parse(json!);
}

export const addSampleData = (): Conversation[] => {
    const conversations: Conversation[] = [
        {
            id: 1,
            title: 'Sample Conversation',
            on: new Date(),
            messages: [
                { content: 'Hello!', role: 'user', on: new Date() },
                { content: 'Hi!', role: 'system', on: new Date() },
                { content: 'How are you?', role: 'user', on: new Date() },
                { content: 'Good, thanks!', role: 'system', on: new Date() },
                { content: 'What are you doing?', role: 'user', on: new Date() },
                { content: 'I am working on my project.', role: 'system', on: new Date() },
                { content: 'That\'s cool!', role: 'user', on: new Date() },
                { content: 'Thanks!', role: 'system', on: new Date() },
                { content: 'Bye!', role: 'user', on: new Date() },
                { content: 'Goodbye!', role: 'system', on: new Date() },
            ]
        }
    ]
    persistData('conversations', conversations);
    return conversations;
}