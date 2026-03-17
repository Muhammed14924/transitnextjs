"use client";

import { UserWithRelations } from "@/types/user";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface Props {
  users: UserWithRelations[];
  onEdit: (user: UserWithRelations) => void;
  onDelete: (user: UserWithRelations) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: Props) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">ADMIN</Badge>;
      case "MANAGER":
        return <Badge variant="default">MANAGER</Badge>;
      case "USER":
        return <Badge variant="secondary">USER</Badge>;
      case "GUEST":
        return <Badge variant="outline">GUEST</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || "Unnamed"}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                    {user.username && (
                      <span className="text-[10px] text-muted-foreground/80">
                        @{user.username}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                <span className="text-sm">
                  {user.team ? user.team.name : "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {user.orgCompany ? user.orgCompany.name : "—"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
