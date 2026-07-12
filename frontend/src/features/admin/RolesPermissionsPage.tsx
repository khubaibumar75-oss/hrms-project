import { Fragment, useMemo, useState } from "react";
import { Check, ShieldCheck, Loader2 } from "lucide-react";
import Loader from "@/components/common/Loader";
import { usePermissionsMatrix, useToggleRolePermission } from "./permissionsApi";
import type { Permission } from "@/types";
import { cn } from "@/lib/utils";

const LOCKED_ROLE = "Super Admin";

export default function RolesPermissionsPage() {
  const { data, isLoading } = usePermissionsMatrix();
  const toggleMutation = useToggleRolePermission();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    if (!data) return {} as Record<string, Permission[]>;
    const map: Record<string, Permission[]> = {};
    data.permissions.forEach((p) => {
      if (!map[p.module]) map[p.module] = [];
      map[p.module].push(p);
    });
    return map;
  }, [data]);

  if (isLoading || !data) return <Loader label="Loading roles & permissions…" />;

  const hasPermission = (roleId: string, permissionId: string) =>
    data.assignments.some((a) => a.role_id === roleId && a.permission_id === permissionId);

  const handleToggle = (roleId: string, roleName: string, permissionId: string) => {
    if (roleName === LOCKED_ROLE) return;
    const key = `${roleId}:${permissionId}`;
    const granted = hasPermission(roleId, permissionId);
    setPendingKey(key);
    toggleMutation.mutate(
      { role_id: roleId, permission_id: permissionId, grant: !granted },
      { onSettled: () => setPendingKey(null) }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Roles & permissions
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Control what each role can see and do across the system. Super Admin always has full access.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Permission
              </th>
              {data.roles.map((role) => (
                <th
                  key={role.id}
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-1">
                    {role.name}
                    {role.name === LOCKED_ROLE && <ShieldCheck className="h-3 w-3 text-accent" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([module, perms]) => (
              <Fragment key={module}>
                <tr className="bg-muted/40">
                  <td colSpan={data.roles.length + 1} className="px-4 py-2 text-xs font-semibold text-foreground">
                    {module}
                  </td>
                </tr>
                {perms.map((perm) => (
                  <tr key={perm.id} className="border-b border-border last:border-0">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-foreground">
                      <p className="text-sm">{perm.name}</p>
                      <p className="text-xs text-muted-foreground">{perm.action}</p>
                    </td>
                    {data.roles.map((role) => {
                      const granted = hasPermission(role.id, perm.id);
                      const locked = role.name === LOCKED_ROLE;
                      const isPending = pendingKey === `${role.id}:${perm.id}` && toggleMutation.isPending;
                      return (
                        <td key={role.id} className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => handleToggle(role.id, role.name, perm.id)}
                            disabled={locked || isPending}
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                              granted || locked
                                ? "border-success bg-success/10 text-success"
                                : "border-border text-transparent hover:border-primary/40",
                              locked ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                            )}
                            aria-label={`${granted ? "Revoke" : "Grant"} ${perm.name} for ${role.name}`}
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              (granted || locked) && <Check className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}