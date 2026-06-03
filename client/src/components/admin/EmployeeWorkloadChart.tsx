import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import type { AdminEmployee } from "@/types/admin";

interface Props {
  employees: AdminEmployee[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + p.value, 0);
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg px-4 py-3 text-sm min-w-[160px]">
      <p className="font-bold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.fill }} />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-border mt-2 pt-2 flex justify-between text-xs font-bold">
        <span>Total</span><span>{total}</span>
      </div>
    </div>
  );
}

export default function EmployeeWorkloadChart({ employees }: Props) {
  const data = employees.map(e => ({
    name: e.name.split(" ")[0],
    fullName: e.name,
    Pending:   e.pendingCount,
    Confirmed: e.confirmedCount,
    Rejected:  e.rejectedCount,
    isOnLeave: e.isOnLeave,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v, i) => data[i]?.isOnLeave ? `${v} 🏖️` : v}
        />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="Pending" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} name="Pending">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isOnLeave ? "#E5E7EB" : "#F59E0B"} />
          ))}
        </Bar>
        <Bar dataKey="Confirmed" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} name="Confirmed">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isOnLeave ? "#D1FAE5" : "#22C55E"} />
          ))}
        </Bar>
        <Bar dataKey="Rejected" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} name="Rejected">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isOnLeave ? "#FEE2E2" : "#EF4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
