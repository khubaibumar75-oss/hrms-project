import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, Permission, Role } from "@/types";

interface RolePermissionAssignment {
  role_id: string;
  permission_id: string;
}

interface PermissionsMatrixData {
  roles: Role[];
  permissions: Permission[];
  assignments: RolePermissionAssignment[];
}

const KEYS = {
  matrix: ["roles", "permissions", "matrix"] as const,
};

async function fetchMatrix(): Promise<PermissionsMatrixData> {
  const [rolesRes, permsRes, assignmentsRes] = await Promise.all([
    axiosInstance.get<ApiResponse<Role[]>>("/roles"),
    axiosInstance.get<ApiResponse<Permission[]>>("/permissions"),
    axiosInstance.get<ApiResponse<RolePermissionAssignment[]>>("/role-permissions"),
  ]);
  return {
    roles: rolesRes.data.data,
    permissions: permsRes.data.data,
    assignments: assignmentsRes.data.data,
  };
}

async function toggleRolePermission({
  role_id,
  permission_id,
  grant,
}: {
  role_id: string;
  permission_id: string;
  grant: boolean;
}) {
  if (grant) {
    await axiosInstance.post("/role-permissions", { role_id, permission_id });
  } else {
    await axiosInstance.delete(`/role-permissions/${role_id}/${permission_id}`);
  }
}

export function usePermissionsMatrix() {
  return useQuery({ queryKey: KEYS.matrix, queryFn: fetchMatrix });
}

export function useToggleRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleRolePermission,
    // Optimistic update — a matrix with many cells feels broken if every
    // click waits on a round trip before the checkbox moves.
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: KEYS.matrix });
      const previous = queryClient.getQueryData<PermissionsMatrixData>(KEYS.matrix);
      if (previous) {
        const next: PermissionsMatrixData = {
          ...previous,
          assignments: vars.grant
            ? [...previous.assignments, { role_id: vars.role_id, permission_id: vars.permission_id }]
            : previous.assignments.filter(
                (a) => !(a.role_id === vars.role_id && a.permission_id === vars.permission_id)
              ),
        };
        queryClient.setQueryData(KEYS.matrix, next);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(KEYS.matrix, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEYS.matrix }),
  });
}