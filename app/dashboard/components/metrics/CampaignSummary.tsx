import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Gauge, BarChart2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { BaseChart } from "../charts/BaseChart";
import { DonutChart } from "../charts/DonutChart";

interface CampaignSummaryProps {
  data: {
    total_campaigns: number;
    active_campaigns: number;
    avg_emails_per_campaign: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export const CampaignSummary = ({ data, loading, error }: CampaignSummaryProps) => {
  return (
    <BaseChart
      title="Campaign Summary"
      description="Overview of your campaigns"
      isLoading={loading}
      error={error}
      className="col-span-1 md:col-span-3"
    >
      <div className="space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : data?.total_campaigns || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time campaigns</p>
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : data?.active_campaigns || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          {/* Average Emails per Campaign */}
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Emails</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  Math.round((data?.avg_emails_per_campaign || 0) * 10) / 10
                )}
              </div>
              <p className="text-xs text-muted-foreground">Per campaign</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Activity Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <Gauge className="h-4 w-4 mr-2 text-emerald-500" />
              Campaign Activity
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DonutChart 
              title="Active vs Inactive"
              data={[
                { 
                  name: 'Active', 
                  value: data?.active_campaigns || 0, 
                  color: '#10b981' 
                },
                { 
                  name: 'Inactive', 
                  value: Math.max(0, (data?.total_campaigns || 0) - (data?.active_campaigns || 0)), 
                  color: '#e2e8f0' 
                },
              ]}
              height={200}
              className="border rounded-lg p-4"
            />
            <div className="border rounded-lg p-4 flex flex-col justify-center">
              <div className="text-sm text-muted-foreground mb-2">Average Emails per Campaign</div>
              <div className="text-3xl font-bold">
                {loading ? 
                  <Skeleton className="h-8 w-20" /> : 
                  data?.avg_emails_per_campaign?.toFixed(1) || '0.0'
                }
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Across all campaigns
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseChart>
  );
};
