import { RequestHandler, Response } from 'express';
import { users } from 'server';
import { CustomRequest } from 'types/types';
// import { JsonWebTokenError, Jwt, JwtPayload } from 'jsonwebtoken';
import { validateToken } from 'utils/jwt.utils';
export interface VerifyInterface {
    exp: number;
    iat: number;
    username: string;
}

// type Response = void | JsonWebTokenError | string | Jwt | JwtPayload;
export const verifyToken: RequestHandler = (
    request: CustomRequest<{ token: string }>,
    response: Response,
) => {
    console.log('request na be ', request.body.token);
    const verify = validateToken(request.body.token) as VerifyInterface;
    if (verify instanceof Error) {
        return response.send(verify);
    }
    if (!(verify instanceof Error)) {
        const { username } = verify;
        let userID;
        for (const key in users) {
            console.log('key: ', key, 'users[key]: ', users[key]);
            if (users[key].username == username) {
                console.log(key);
                userID = key;
                console.log('userID', userID);
            }
        }
        console.log('userID', userID);
        response.send({ verify, userID });
    }
};
