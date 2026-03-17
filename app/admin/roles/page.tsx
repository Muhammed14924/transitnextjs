import { redirect } from "next/navigation";

export default function RedirectToDashboardRoles() {
  redirect("/dashboard/admin/roles");
}
