import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;

export const signJWT = (payload: object): string => {
  return jwt.sign(payload, secretKey, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
};