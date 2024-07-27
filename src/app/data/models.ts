

export class Config {
    public apiKey?: string;
    public deployment?: string;
    public apiVersion?: string;
    public endpoint?: string;
}

export class Conversation {
    public id?: number;
    public title?: string;
    public messages: Array<Message> = [];
    public on: Date = new Date();
}

export class Message {
    public content: string | null = null;
    public role: string | null = null;
    public on: Date | null = new Date();
}