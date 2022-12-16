import { Request } from 'express';

export enum Events {
    NEW_MESSAGE = 'new-message',
    NEW_MESSAGE_UPDATE = 'new-message-update',
    NEW_MESSAGE_USERNAME_NOT_REGISTERED = 'new-message-username-not-registered',
    SET_USERNAME = 'set-username',
    SET_USERNAME_SUCCESS = 'set-username-success',
    SET_USERNAME_FAILURE = 'set-username-failure',
    UPDATE_USERNAMES = 'update-usernames',
    USER_DISCONNECTED = 'user-disconnected',
    USER_RECONNECT = 'user-reconnect',
}

export type Message = {
    content: string;
    author: string;
    timestamp: string;
    id: string;
    replyTo?: string;
};

export type User = Record<string, { username: string; socketID: string }>;

export type Body = { username: string; socketID: string };
export interface CustomRequest<Body> extends Request {
    body: Body;
}
