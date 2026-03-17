"use client";

import React, { useState } from "react";
import { Permission as PrismaPermission, RolePermission } from "@prisma/client";
import { Button } from "@/app/components/ui/button";
import { Loader2, ArrowRight, Shield, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

type Role = "ADMIN" | "MANAGER" | "USER" | "GUEST";
const ROLES: Role[] = ["ADMIN", "MANAGER", "USER", "GUEST"];

const GROUPS = {
  Dashboard: ["VIEW_DASHBOARD"],
  Shipments: ["CREATE_SHIPMENT", "VIEW_SHIPMENT", "EDIT_SHIPMENT", "DELETE_SHIPMENT"],
  Containers: ["CREATE_CONTAINER", "VIEW_CONTAINER", "EDIT_CONTAINER", "DELETE_CONTAINER"],
  Trips: ["CREATE_TRIP", "VIEW_TRIP", "EDIT_TRIP", "DELETE_TRIP"],
  Documents: ["UPLOAD_DOCUMENT", "VIEW_DOCUMENT", "DELETE_DOCUMENT"],
  Users: ["MANAGE_USERS", "VIEW_USERS"],
  Settings: ["MANAGE_SETTINGS", "VIEW_SETTINGS"],
  Companies: ["MANAGE_COMPANIES", "VIEW_COMPANIES"],
  Traders: ["CREATE_TRADER", "VIEW_TRADER", "EDIT_TRADER", "DELETE_TRADER"],
  Gates: ["CREATE_GATE", "VIEW_GATE", "EDIT_GATE", "DELETE_GATE"],
  Ports: ["CREATE_PORT", "VIEW_PORT", "EDIT_PORT", "DELETE_PORT"],
  Depots: ["CREATE_DEPOT", "VIEW_DEPOT", "EDIT_DEPOT", "DELETE_DEPOT"],
  Items: ["CREATE_ITEM_TYPE", "VIEW_ITEM_TYPE", "EDIT_ITEM_TYPE", "DELETE_ITEM_TYPE", "CREATE_COMP_ITEM", "VIEW_COMP_ITEM", "EDIT_COMP_ITEM", "DELETE_COMP_ITEM"],
  "Sub Companies": ["CREATE_SUB_COMPANY", "VIEW_SUB_COMPANY", "EDIT_SUB_COMPANY", "DELETE_SUB_COMPANY"],
  "Transport Co.": ["CREATE_TRANSPORT_COMPANY", "VIEW_TRANSPORT_COMPANY", "EDIT_TRANSPORT_COMPANY", "DELETE_TRANSPORT_COMPANY"],
  Destinations: ["CREATE_DESTINATION", "VIEW_DESTINATION", "EDIT_DESTINATION", "DELETE_DESTINATION"],
  Units: ["CREATE_UNIT", "VIEW_UNIT", "EDIT_UNIT", "DELETE_UNIT"],
};

interface Props {
  permissions: PrismaPermission[];
  rolePermissions: (RolePermission & { permission: PrismaPermission })[];
}

export default function RolesPermissionsClient({
  permissions,
  rolePermissions,
}: Props) {
  // Initialize matrix: Map<Role, Set<string>>
  const initialMatrix = ROLES.reduce((acc, role) => {
    acc[role] = new Set<string>();
    return acc;
  }, {} as Record<Role, Set<string>>);

  // Mark all for ADMIN as default safe-measure
  permissions.forEach((p) => {
    initialMatrix["ADMIN"].add(p.name);
  });

  rolePermissions.forEach((rp) => {
    initialMatrix[rp.role as Role].add(rp.permission.name);
  });

  const [matrix, setMatrix] = useState<Record<Role, Set<string>>>(initialMatrix);
  const [pendingChanges, setPendingChanges] = useState<
    { role: Role; permissionName: string; action: "add" | "remove" }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = pendingChanges.length > 0;

  const handleCheckboxChange = (
    role: Role,
    permissionName: string,
    checked: boolean
  ) => {
    if (role === "ADMIN") return;

    setMatrix((prev) => {
      const newMatrix = { ...prev };
      const newSet = new Set(newMatrix[role]);
      if (checked) {
        newSet.add(permissionName);
      } else {
        newSet.delete(permissionName);
      }
      newMatrix[role] = newSet;
      return newMatrix;
    });

    setPendingChanges((prev) => {
      const filtered = prev.filter(
        (c) => !(c.role === role && c.permissionName === permissionName)
      );
      return [
        ...filtered,
        { role, permissionName, action: checked ? "add" : "remove" },
      ];
    });
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes: pendingChanges }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save permissions");
      }

      toast.success("تم حفظ الصلاحيات بنجاح");
      setPendingChanges([]);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border shadow-sm ring-1 ring-slate-200/50">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Shield size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              إدارة الصلاحيات والأدوار
              <span className="text-xs font-bold px-3 py-1 bg-primary/5 text-primary rounded-full border border-primary/10">
                لوحة التحكم
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              تحكم في مستوى الوصول لكل نوع من المستخدمين في النظام
            </p>
          </div>
        </div>
        
        <Link href="/dashboard" passHref>
          <Button variant="outline" className="rounded-2xl gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all h-12 px-6 group">
             العودة للرئيسية <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-[32px] border shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-sm font-black text-slate-900 w-1/4">المجموعة والوحدة</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-6 py-5 text-sm font-black text-slate-900 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="uppercase tracking-widest text-[11px] text-slate-400">{role}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-md",
                        role === 'ADMIN' ? "bg-amber-50 text-amber-600" :
                        role === 'MANAGER' ? "bg-blue-50 text-blue-600" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {role === 'ADMIN' ? 'مدير كامل' : role === 'MANAGER' ? 'مدير قسم' : role === 'USER' ? 'موظف' : 'ضيف'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(GROUPS).map(([groupName, permNames]) => (
                <React.Fragment key={groupName}>
                  <tr className="bg-slate-50/30">
                    <td colSpan={ROLES.length + 1} className="px-8 py-3 text-sm font-black text-primary bg-primary/5 border-r-4 border-primary">
                      {groupName}
                    </td>
                  </tr>
                  {permNames.map((permName) => {
                    const permissionExists = permissions.some((p) => p.name === permName);
                    if (!permissionExists) return null;

                    return (
                      <tr key={permName} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                              {permName.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {permName}
                            </span>
                          </div>
                        </td>
                        {ROLES.map((role) => (
                          <td key={role} className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <label className="relative flex items-center cursor-pointer group/check">
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={matrix[role].has(permName)}
                                  disabled={role === "ADMIN" || isSaving}
                                  onChange={(e) =>
                                    handleCheckboxChange(role, permName, e.target.checked)
                                  }
                                />
                                <div className={cn(
                                  "w-6 h-6 rounded-lg border-2 border-slate-200 transition-all duration-300",
                                  "peer-checked:bg-primary peer-checked:border-primary peer-checked:shadow-lg peer-checked:shadow-primary/20",
                                  "peer-disabled:opacity-40 peer-disabled:cursor-not-allowed",
                                  "flex items-center justify-center text-white"
                                )}>
                                  <CheckCircle2 size={16} className={cn(
                                    "scale-0 transition-transform duration-300",
                                    matrix[role].has(permName) && "scale-100"
                                  )} />
                                </div>
                              </label>
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white p-4 rounded-[24px] shadow-2xl flex items-center justify-between ring-4 ring-white shadow-primary/20">
            <div className="flex items-center gap-3 px-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
              <span className="text-sm font-bold tracking-tight">لديك تغييرات غير محفوظة ({pendingChanges.length})</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setMatrix(initialMatrix);
                  setPendingChanges([]);
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-4"
              >
                تجاهل
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 gap-2 shadow-lg shadow-primary/20 h-10"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
