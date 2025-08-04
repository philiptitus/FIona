import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, MailCheck, PieChart as PieChartIcon } from "lucide-react";
import { BaseChart } from "../charts/BaseChart";
import { DonutChart } from "../charts/DonutChart";

interface EngagementMetricsProps {
  data: {
    total_contacts: number;
    contacted_contacts: number;
    unique_organizations: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export const EngagementMetrics = ({ data, loading, error }: EngagementMetricsProps) => {
  const contactedPercentage = data?.total_contacts 
    ? Math.round((data.contacted_contacts / data.total_contacts) * 100) 
    : 0;

  return (
    <BaseChart
      title="Engagement"
      description="Contact and organization metrics"
      isLoading={loading}
      error={error}
      className="col-span-1 md:col-span-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : data?.total_contacts?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">In your campaigns</p>
          </CardContent>
        </Card>

        {/* Contacted Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <MailCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  {data?.contacted_contacts?.toLocaleString() || 0}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({contactedPercentage}%)
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Contacts reached</p>
          </CardContent>
        </Card>

        {/* Unique Organizations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : data?.unique_organizations?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Unique companies</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Contact Engagement Donut Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2 text-purple-500" />
            Contact Engagement
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DonutChart 
            title="Contact Status"
            data={[
              { name: 'Contacted', value: data?.contacted_contacts || 0, color: '#8b5cf6' },
              { name: 'Not Contacted', value: (data?.total_contacts || 0) - (data?.contacted_contacts || 0), color: '#e2e8f0' },
            ]}
            height={200}
            className="border rounded-lg p-4"
          />
          <DonutChart 
            title="Contacts by Organization"
            data={[
              { name: 'Organizations', value: data?.unique_organizations || 0, color: '#a78bfa' },
              { name: 'Other', value: Math.max(0, (data?.total_contacts || 0) - (data?.unique_organizations || 0)), color: '#e2e8f0' },
            ]}
            height={200}
            className="border rounded-lg p-4"
          />
        </div>
      </div>
    </BaseChart>
  );
};
