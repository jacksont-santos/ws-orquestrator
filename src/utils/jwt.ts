import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;
const tokenKey = process.env.TOKEN_KEY;

export const signJWT = (payload: object): string => {
  return jwt.sign(payload, tokenKey, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, tokenKey);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyPassword = (token: string) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
};