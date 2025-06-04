import { hash, compare } from 'bcrypt';

export const hashPassword = async (password: string, saltRounds: number): Promise<string> => {
    return await hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await compare(password, hashedPassword);
};
