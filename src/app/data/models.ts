

export class Config {
    public apiVersion?: string;

    public apiKey?: string;
    public deployment?: string;
    public endpoint?: string;
    
    public imageApiKey?:string;
    public imageEndpoint?:string;
    public imageDeployment?:string;
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