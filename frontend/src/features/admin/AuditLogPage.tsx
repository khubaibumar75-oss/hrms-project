import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import { useAuditLogs, type AuditLogWithActor } from "./auditApi";

const ENTITY_OPTIONS = [
  "Employee",
  "LeaveRequest",
  "Goal",
  "Review",
  "Department",
  "Team",
  "Role",
];

function actionPillClass(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes("CREATE")) return "status-pill status-pill-success";
  if (upper.includes("DELETE") || upper.includes("REJECT")) return "status-pill status-pill-destructive";
  if (upper.includes("UPDATE") || upper.includes("APPROVE")) return "status-pill status-pill-info";
  return "status-pill status-pill-muted";
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface DiffRow {
  key: string;
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
}

function computeDiff(oldData?: Record<string, unknown>, newData?: Record<string, unknown>): DiffRow[] {
  const keys = new Set([...Object.keys(oldData ?? {}), ...Object.keys(newData ?? {})]);
  const rows: DiffRow[] = [];
  keys.forEach((key) => {
    const hasOld = oldData && key in oldData;
    const hasNew = newData && key in newData;
    if (!hasOld && hasNew) {
      rows.push({ key, type: "added", newValue: newData![key] });
    } else if (hasOld && !hasNew) {
      rows.push({ key, type: "removed", oldValue: oldData![key] });
    } else if (hasOld && hasNew && JSON.stringify(oldData![key]) !== JSON.stringify(newData![key])) {
      rows.push({ key, type: "changed", oldValue: oldData![key], newValue: newData![key] });
    }
  });
  return rows;
}

function formatValue(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function DiffDialog({ log, onClose }: { log: AuditLogWithActor | null; onClose: () => void }) {
  if (!log) return null;
  const diff = computeDiff(log.old_data, log.new_data);

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {log.action} — {log.entity}
          </DialogTitle>
          <DialogDescription>
            {log.actor?.full_name ?? "System"} · {formatDateTime(log.created_at)} · record{" "}
            <span className="font-mono">{log.entity_id}</span>
          </DialogDescription>
        </DialogHeader>

        {diff.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No field-level changes recorded.</p>
        ) : (
          <div className="space-y-2">
            {diff.map((row) => (
              <div key={row.key} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-foreground">{row.key}</span>
                  <span
                    className={
                      row.type === "added"
                        ? "status-pill status-pill-success"
                        : row.type === "removed"
                          ? "status-pill status-pill-destructive"
                          : "status-pill status-pill-warning"
                    }
                  >
                    {row.type}
                  </span>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs">
                  {row.oldValue !== undefined && (
                    <p className="text-destructive line-through decoration-destructive/50">
                      {formatValue(row.oldValue)}
                    </p>
                  )}
                  {row.newValue !== undefined && <p className="text-success">{formatValue(row.newValue)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("all");
  const [activeLog, setActiveLog] = useState<AuditLogWithActor | null>(null);
  const limit = 15;

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    search,
    entity: entity === "all" ? undefined : entity,
  });

  const columns: DataTableColumn<AuditLogWithActor>[] = [
    {
      key: "created_at",
      header: "When",
      render: (row) => <span className="font-mono text-xs text-muted-foreground">{formatDateTime(row.created_at)}</span>,
    },
    {
      key: "actor",
      header: "Actor",
      render: (row) => <span className="text-sm text-foreground">{row.actor?.full_name ?? "System"}</span>,
    },
    {
      key: "action",
      header: "Action",
      render: (row) => <span className={actionPillClass(row.action)}>{row.action}</span>,
    },
    {
      key: "entity",
      header: "Entity",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.entity} <span className="font-mono text-xs">#{row.entity_id.slice(0, 8)}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Audit log</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every tracked change across the system. Click a row to see what changed.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No audit entries match these filters."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by actor…"
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        limit={limit}
        onPageChange={setPage}
        onRowClick={setActiveLog}
        filtersSlot={
          <Select
            value={entity}
            onValueChange={(v) => {
              setEntity(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {ENTITY_OPTIONS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {!data?.items.length && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <ScrollText className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}

      <DiffDialog log={activeLog} onClose={() => setActiveLog(null)} />
    </div>
  );
}