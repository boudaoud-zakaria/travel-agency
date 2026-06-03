import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  value: number;   // 0–100
  label: string;
  color?: string;
}

export default function PerformanceGauge({ value, label, color = "#22C55E" }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  const data = [
    { value: clamped },
    { value: 100 - clamped },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={68}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="hsl(214 32% 91%)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black" style={{ color }}>
            {clamped.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
