

export class Config {
    public key?: string;
    public deployment?: string;
}

export class Conversation {
    public id?: number;
    public title?: string;
    public messages?: Array<Message>;
    public on?: Date;
}

export class Message {
    public text?: string;
    public role?: number;
    public on?: Date;
}