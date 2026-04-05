"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface IndustryBreakdownProps {
  data: Record<string, number>
}

const INDUSTRY_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#d946ef", // fuchsia
]

export default function IndustryBreakdown({ data }: IndustryBreakdownProps) {
  // Convert object to array and sort by value descending
  const sortedIndustries = Object.entries(data)
    .map(([industry, count]) => ({
      industry: industry.charAt(0).toUpperCase() + industry.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  // Top 8 industries + "Other" for the rest
  const maxDisplay = 8
  let chartData = sortedIndustries.slice(0, maxDisplay)
  const otherIndustries = sortedIndustries.slice(maxDisplay)
  const otherCount = otherIndustries.reduce((sum, ind) => sum + ind.count, 0)

  if (otherCount > 0) {
    chartData.push({
      industry: `Other (${otherIndustries.length})`,
      count: otherCount,
    })
  }

  const totalCount = sortedIndustries.reduce((sum, ind) => sum + ind.count, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalCount) * 100).toFixed(1)
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="text-sm font-semibold">{payload[0].payload.industry}</p>
          <p className="text-sm text-emerald-400">
            {payload[0].value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (totalCount === 0) {
    return (
      <Card className="p-6 rounded-2xl border-2 border-slate-200 shadow-md">
        <div className="text-center py-12">
          <p className="text-slate-500 font-medium">No industry data available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 rounded-2xl border-2 border-slate-200 shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Industry Breakdown</h3>
        <p className="text-sm text-slate-500 mt-1">Distribution of emails sent by industry</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 200, bottom: 10 }}
        >
          <defs>
            <linearGradient id="industryGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
          <YAxis
            type="category"
            dataKey="industry"
            tick={{ fontSize: 11, fill: "#374151" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} isAnimationActive>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Industries</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{sortedIndustries.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Emails</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Top Industry</p>
            <p className="text-lg font-bold text-emerald-600 mt-1">
              {sortedIndustries[0]?.count.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Avg per Industry</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {Math.round(totalCount / sortedIndustries.length).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {otherIndustries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                {otherIndustries.length} additional {otherIndustries.length === 1 ? "industry" : "industries"}:
              </p>
              <div className="space-y-2">
                {otherIndustries.map((ind, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{ind.industry}</span>
                    <span className="font-semibold text-slate-800">
                      {ind.count.toLocaleString()} ({((ind.count / totalCount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
