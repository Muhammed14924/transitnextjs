
import { Role, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";
const JWT_SECRET = process.env.JWT_SECRET!;
export const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}

export const generateToken = (userId: string): string => {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    return token;
}

export const verifyToken = (token: string): { userId: string } => {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
}
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return null;
        const decoded = verifyToken(token);
        const userfromDb = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!userfromDb) return null;
        const { password, ...user } = userfromDb;
        return user as User;
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}

export const checkUserPermission = (
    user: User,
    requiredRole: Role
): boolean => {
    const roleHierarchy = {
        [Role.GUEST]: 0,
        [Role.USER]: 1,
        [Role.MANAGER]: 2,
        [Role.ADMIN]: 3
    };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
