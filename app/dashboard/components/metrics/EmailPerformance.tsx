import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, Mail, Target, TrendingUp } from "lucide-react";
import { BaseChart } from "../charts/BaseChart";
import { LineChart } from "../charts/LineChart";

// Mock data for the email trends chart
const mockEmailTrends = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 200 },
  { name: 'Wed', value: 150 },
  { name: 'Thu', value: 250 },
  { name: 'Fri', value: 180 },
  { name: 'Sat', value: 100 },
  { name: 'Sun', value: 80 },
];

interface EmailPerformanceProps {
  data: {
    total_emails: number;
    recent_emails: number;
    reach_percentage: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export const EmailPerformance = ({ data, loading, error }: EmailPerformanceProps) => {
  const reachPercentage = data?.reach_percentage || 0;
  
  return (
    <BaseChart
      title="Email Performance"
      description="Overview of your email metrics"
      isLoading={loading}
      error={error}
      className="col-span-1 md:col-span-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Emails */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : data?.total_emails?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        {/* Recent Emails */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Emails</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : data?.recent_emails || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        {/* Reach Percentage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reach Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  {reachPercentage.toFixed(1)}%
                  <span 
                    className={`ml-2 text-sm ${
                      reachPercentage >= 70 
                        ? 'text-green-500' 
                        : reachPercentage >= 40 
                          ? 'text-yellow-500' 
                          : 'text-red-500'
                    }`}
                  >
                    {reachPercentage >= 70 ? '↑' : reachPercentage >= 40 ? '→' : '↓'}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Contacts reached</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Email Trends Line Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
            Email Trends (Last 7 Days)
          </h3>
          <div className="text-sm text-muted-foreground">
            {new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <LineChart 
          title=""
          data={mockEmailTrends}
          height={200}
          color="#3b82f6"
          className="border rounded-lg p-4"
        />
      </div>
    </BaseChart>
  );
};
