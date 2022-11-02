export enum Events {
    NEW_MESSAGE = 'new-message',
    NEW_MESSAGE_UPDATE = 'new-message-update',
    SET_USERNAME = 'set-username',
    SET_USERNAME_SUCCESS = 'set-username-success',
    SET_USERNAME_FAILURE = 'set-username-failure',
    USERNAME_NOT_REGISTERED = 'username-not-registered',
}

export type Message = {
    content: string;
    author: string;
    timestamp: string;
    id: string;
};

export type User = Record<string, string>;
