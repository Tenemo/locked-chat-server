import {
    JsonWebTokenError,
    Jwt,
    JwtPayload,
    sign,
    SignOptions,
    // TokenExpiredError,
    verify,
    VerifyOptions,
} from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

/**
 * generates JWT used for local testing
 */
type User = {
    username: string;
    socketID: string;
};
export function generateToken(payload: User): string {
    // information to be encoded in the JWT
    // const payload = {
    //     name: 'Andrés Reales',
    //     userId: 123,
    //     accessTypes: ['getTeams', 'addTeams', 'updateTeams', 'deleteTeams'],
    // };
    // read private key value
    const privateKey = {
        key: fs.readFileSync(path.join(__dirname, './../../private.key')),
        passphrase: 'lockedchat',
    };

    const signInOptions: SignOptions = {
        // RS256 uses a public/private key pair. The API provides the private key
        // to generate the JWT. The client gets a public key to validate the
        // signature
        algorithm: 'RS256',
        expiresIn: '1h',
    };

    // generate JWT
    return sign(payload, privateKey, signInOptions);
}

/**
 * checks if JWT token is valid
 *
 * @param token the expected token payload
 */
//Promise<TokenPayload>
export function validateToken(
    token: string,
): void | JsonWebTokenError | string | Jwt | JwtPayload {
    const publicKey = fs.readFileSync(
        path.join(__dirname, './../../public.key'),
    );

    const verifyOptions: VerifyOptions = {
        algorithms: ['RS256'],
    };

    try {
        const decoded = verify(token, publicKey, verifyOptions);
        console.log('try ', decoded);
        return decoded;
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            // name: 'JsonWebTokenError', message: 'invalid signature'
            console.log('error w catchu ');
            console.log(error);
            // console.log('test ', error.message);
            // if (error instanceof TokenExpiredError) {
            //     //name: 'TokenExpiredError', message: 'jwt expired', expiredAt: '2022-12-13T10:10:10.000Z'
            //     console.log('token wygasl');
            // }
            return error;
            // if(error instanceof )
        } else {
            //todo co jeśli inny błąd? może byc tak ?:D
            console.log('wystąpił nieoczekiwany błąd');
        }
    }
    // return new Promise((resolve, reject) => {
    //     verify(token, publicKey, verifyOptions, (error, decoded) => {
    //         if (error) {
    //             console.log('zly token ');
    //             return reject(error);
    //         }

    //         resolve(decoded as TokenPayload);
    //     });
    // });
}
