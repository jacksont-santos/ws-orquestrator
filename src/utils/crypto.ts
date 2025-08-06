import bcrypt from 'bcrypt';

export const comparePasswords = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};