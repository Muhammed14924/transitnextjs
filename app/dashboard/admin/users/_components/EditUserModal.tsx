"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserWithRelations } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "USER", "GUEST"]),
  teamId: z.string().optional(),
  orgCompanyId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  user: UserWithRelations | null;
  onClose: () => void;
  onSuccess: (updatedUser: UserWithRelations) => void;
  teams: { id: string; name: string }[];
  orgCompanies: { id: string; name: string }[];
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSuccess,
  teams,
  orgCompanies,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name || "",
        email: user.email,
        password: "", // intentionally empty
        role: user.role,
        teamId: user.teamId || "NONE",
        orgCompanyId: user.orgCompanyId || "NONE",
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        teamId: data.teamId === "NONE" ? null : data.teamId,
        orgCompanyId: data.orgCompanyId === "NONE" ? null : data.orgCompanyId,
      };

      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }

      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to update user");
      }

      onSuccess(json as UserWithRelations);
      
      toast.success("User updated successfully");

      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input id="edit-name" {...register("name")} disabled={isSubmitting} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input id="edit-email" type="email" {...register("email")} disabled={isSubmitting} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              disabled={isSubmitting}
              value={watch("role")}
              onValueChange={(val: any) => setValue("role", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="GUEST">Guest</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Team</Label>
            <Select
              disabled={isSubmitting}
              value={watch("teamId")}
              onValueChange={(val) => setValue("teamId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No Team</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Organization / Company</Label>
            <Select
              disabled={isSubmitting}
              value={watch("orgCompanyId")}
              onValueChange={(val) => setValue("orgCompanyId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No Company</SelectItem>
                {orgCompanies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
