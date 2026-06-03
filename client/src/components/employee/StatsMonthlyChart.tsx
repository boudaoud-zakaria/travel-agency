import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import type { EmployeeStats } from "@/types/employee";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Props {
  data: EmployeeStats[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsMonthlyChart({ data }: Props) {
  const chartData = data.map(s => ({
    month: MONTH_NAMES[s.month - 1],
    handled: s.handled,
    confirmed: s.confirmed,
    rejected: s.rejected,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        <Line
          type="monotone"
          dataKey="handled"
          name="Handled"
          stroke="hsl(215 52% 35%)"
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: "hsl(215 52% 35%)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="confirmed"
          name="Confirmed"
          stroke="#22C55E"
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: "#22C55E" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="rejected"
          name="Rejected"
          stroke="#EF4444"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={{ r: 3, fill: "#EF4444" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
