import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { format, parseISO } from "date-fns"

interface WeeklyActivityChartProps {
  weeklyData: Record<string, number>
}

export default function WeeklyActivityChart({ weeklyData }: WeeklyActivityChartProps) {
  // Convert data to chart format with day names, sorted by date
  const chartData = Object.entries(weeklyData)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => {
      const dateObj = parseISO(date)
      return {
        date,
        dayName: format(dateObj, "EEE"), // Mon, Tue, Wed, etc
        count,
        fullDate: format(dateObj, "MMM d")
      }
    })

  const maxValue = Math.max(...chartData.map(d => d.count))

  return (
    <Card className="p-6 shadow-md">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Weekly Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">Emails sent over the last 7 days</p>
          </div>
          <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-lg">
            Peak: {maxValue} emails
          </span>
        </div>
        
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: -20, bottom: 10 }}
            >
              <defs>
                <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis 
                dataKey="dayName"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "13px", fontWeight: 500 }}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "13px" }}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                domain={[0, Math.ceil(maxValue * 1.15)]}
              />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-xl">
                        <p className="font-semibold text-sm">{data.fullDate}</p>
                        <p className="text-sm text-primary font-bold">
                          {data.count} emails
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, opacity: 0.3 }}
              />
              <Area 
                type="natural" 
                dataKey="count" 
                fill="url(#emailGradient)"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4 border-t">
          {chartData.map((item) => (
            <div key={item.date} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.dayName}</span>
              <span className="text-lg font-bold text-primary">{item.count}</span>
              <span className="text-xs text-muted-foreground">{format(parseISO(item.date), "d")}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
