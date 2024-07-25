import jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from 'jwt/y-websocket-es512-private.pem.json';

// annoyingly this isn't getting tree-shaken in all the right compilation steps when i
// put it straight in route.tsx -- which i guess is fine, because putting it in another
// file is probably the move, but i'm still surprised...
export const genAuthTokenForNoggin_OMNIPOTENT = ({
  nogginId,
  userId,
}: {
  nogginId: number;
  userId: number;
}): string => {
  return jwt.sign(
    {
      nogginId,
      userId,
    },
    JWT_PRIVATE_KEY,
    {
      algorithm: 'ES512',
      expiresIn: '30m',
    },
  );
};
