"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

export function usePermissions() {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/permissions");
        if (res.ok) {
          const data = await res.json();
          setPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPermissions();
    }
  }, [user, authLoading]);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return permissions.includes(permission);
  };

  return { permissions, hasPermission, loading: loading || authLoading };
}
