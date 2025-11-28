import { Card } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ByIndustryPieChartProps {
  industryData: Record<string, number>
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
]

export default function ByIndustryPieChart({ industryData }: ByIndustryPieChartProps) {
  // Convert to chart format
  const chartData = Object.entries(industryData).map(([industry, count]) => ({
    name: industry,
    value: count,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-6 shadow-md flex flex-col h-full">
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Contacts by Industry</h2>
          <span className="text-sm text-muted-foreground font-medium">
            {total.toLocaleString()} total
          </span>
        </div>

        <div className="w-full flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                        <p className="font-semibold text-sm">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.value.toLocaleString()} contacts
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {((data.value / total) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t max-h-36 overflow-y-auto">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground truncate text-xs">{item.name}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <span className="font-semibold text-xs">{item.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
