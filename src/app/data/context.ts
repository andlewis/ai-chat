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
                { text: 'Hello!', role: 1, on: new Date() },
                { text: 'Hi!', role: 2, on: new Date() },
                { text: 'How are you?', role: 1, on: new Date() },
                { text: 'Good, thanks!', role: 2, on: new Date() },
                { text: 'What are you doing?', role: 1, on: new Date() },
                { text: 'I am working on my project.', role: 2, on: new Date() },
                { text: 'That\'s cool!', role: 1, on: new Date() },
                { text: 'Thanks!', role: 2, on: new Date() },
                { text: 'Bye!', role: 1, on: new Date() },
                { text: 'Goodbye!', role: 2, on: new Date() },
            ]
        }
    ]
    persistData('conversations', conversations);
    return conversations;
}