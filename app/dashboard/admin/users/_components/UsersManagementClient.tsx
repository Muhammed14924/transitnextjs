"use client";

import { useState } from "react";
import { UserWithRelations } from "@/types/user";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { PlusCircle, Search } from "lucide-react";
import UsersTable from "./UsersTable";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

interface Props {
  initialUsers: UserWithRelations[];
  teams: { id: string; name: string }[];
  orgCompanies: { id: string; name: string }[];
}

export default function UsersManagementClient({ initialUsers, teams, orgCompanies }: Props) {
  const [users, setUsers] = useState<UserWithRelations[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleEditClick = (user: UserWithRelations) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: UserWithRelations) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const onUserAdded = (newUser: UserWithRelations) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const onUserUpdated = (updatedUser: UserWithRelations) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const onUserDeleted = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Total users: {filteredUsers.length}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="GUEST">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <UsersTable 
          users={filteredUsers} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick} 
        />
      </div>

      <AddUserModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onUserAdded}
        teams={teams}
        orgCompanies={orgCompanies}
      />

      <EditUserModal
        open={isEditModalOpen}
        user={selectedUser}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onUserUpdated}
        teams={teams}
        orgCompanies={orgCompanies}
      />

      <DeleteUserModal
        open={isDeleteModalOpen}
        user={selectedUser}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={onUserDeleted}
      />
    </div>
  );
}
