'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const DATA = [
  { name: "Residential", value: 40, color: "hsl(222, 47%, 11%)" },
  { name: "Commercial", value: 30, color: "hsl(45, 29%, 47%)" },
  { name: "Industrial", value: 20, color: "hsl(197, 37%, 24%)" },
  { name: "Liquidity", value: 10, color: "hsl(210, 40%, 90%)" },
];

export function DemoAllocationChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={DATA}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
