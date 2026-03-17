import { Role, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { Permission, PERMISSIONS } from "./permissions";

export type SessionUser = {
  id: string;
  role: Role;
  teamId: string | null;
  orgCompanyId: string | null;
};
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

export const hasPermission = async (user: SessionUser, permission: Permission): Promise<boolean> => {
    if (user.role === 'ADMIN') return true;

    const record = await prisma.rolePermission.findFirst({
        where: {
            role: user.role,
            permission: {
                name: permission
            }
        }
    });

    return !!record;
};

export const hasAnyPermission = async (user: SessionUser, permissions: Permission[]): Promise<boolean> => {
    if (user.role === 'ADMIN') return true;

    for (const p of permissions) {
        if (await hasPermission(user, p)) return true;
    }
    return false;
};

export const hasAllPermissions = async (user: SessionUser, permissions: Permission[]): Promise<boolean> => {
    if (user.role === 'ADMIN') return true;

    for (const p of permissions) {
        if (!(await hasPermission(user, p))) return false;
    }
    return true;
};

export const isAdmin = (user: SessionUser): boolean => {
    return user.role === 'ADMIN';
};

export const getUserPermissions = async (user: SessionUser): Promise<string[]> => {
    if (user.role === 'ADMIN') return Object.values(PERMISSIONS);

    const records = await prisma.rolePermission.findMany({
        where: { role: user.role },
        include: { permission: true }
    });

    return records.map(r => r.permission.name);
};
