import { motion } from "framer-motion";
import { ACTION_COLORS, ACTION_ICONS, ACTION_LABELS } from "@/hooks/use-activity-log";
import type { ActivityLog } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";

interface Props {
  logs: ActivityLog[];
  maxItems?: number;
}

const INITIALS_COLORS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-red-700",
];

function getColor(employeeId: number) {
  return INITIALS_COLORS[employeeId % INITIALS_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ActivityFeed({ logs, maxItems = 10 }: Props) {
  const items = logs.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((log, i) => {
        const isLast = i === items.length - 1;
        const isEntityCode = log.entityId.startsWith("RHL-");

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3 relative"
          >
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(log.employeeId)} flex items-center justify-center text-white text-[10px] font-bold shrink-0 z-10`}
            >
              {getInitials(log.employeeName)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-snug">
                  <span className="font-semibold text-foreground">
                    {log.employeeName.split(" ")[0]}
                  </span>{" "}
                  <span className={`font-medium ${ACTION_COLORS[log.action] ?? "text-muted-foreground"}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>{" "}
                  {isEntityCode && (
                    <span className="font-mono text-xs text-primary bg-primary/8 px-1.5 py-0.5 rounded">
                      {log.entityId}
                    </span>
                  )}
                </p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                  {ACTION_ICONS[log.action] ?? "📝"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/70">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
