"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface WeeklyChartProps {
  data: Record<string, number>
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  // Convert object to array and sort by date
  const chartData = Object.entries(data)
    .map(([date, count]) => ({
      date,
      count,
      displayDate: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Find max value for coloring
  const maxValue = Math.max(...chartData.map((d) => d.count), 1)
  const avgValue = chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length

  const getBarColor = (value: number) => {
    if (value === maxValue && value > 0) return "#10b981" // emerald (peak)
    if (value > avgValue) return "#8b5cf6" // violet (above avg)
    if (value === 0) return "#e5e7eb" // gray (no activity)
    return "#3b82f6" // blue (normal)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="text-sm font-semibold">{payload[0].payload.displayDate}</p>
          <p className="text-sm text-emerald-400">
            {payload[0].value} {payload[0].value === 1 ? "email" : "emails"}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6 rounded-2xl border-2 border-slate-200 shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Weekly Activity</h3>
        <p className="text-sm text-slate-500 mt-1">Email sending activity over the last 7 days</p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            label={{ value: "Emails", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 12, fill: "#6b7280" } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} isAnimationActive>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Sent</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {chartData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Daily Avg</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.round(avgValue).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Peak Day</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {Math.max(...chartData.map((d) => d.count)).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  )
}
