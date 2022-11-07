export enum Events {
    NEW_MESSAGE = 'new-message',
    NEW_MESSAGE_UPDATE = 'new-message-update',
    NEW_MESSAGE_USERNAME_NOT_REGISTERED = 'new-message-username-not-registered',
    SET_USERNAME = 'set-username',
    SET_USERNAME_SUCCESS = 'set-username-success',
    SET_USERNAME_FAILURE = 'set-username-failure',
    USER_LEFT_CHAT = 'user-left-chat',
}

export type Message = {
    content: string;
    author: string;
    timestamp: string;
    id: string;
};

export type User = Record<string, string>;
