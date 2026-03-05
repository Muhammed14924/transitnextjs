export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  MANAGER = "MANAGER",
  GUEST = "GUEST",
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  team?: Team;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Depot {
  id: number;
  depot_code: string;
  depot_name: string;
  location?: string | null;
  manager_name?: string | null;
  contact_number?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
