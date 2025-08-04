import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Mail, FileText, CheckCircle2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { BaseChart } from "../charts/BaseChart";
import { DonutChart } from "../charts/DonutChart";

interface SystemHealthProps {
  data: {
    connected_mailboxes: number;
    email_templates: number;
    email_contents: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export const SystemHealth = ({ data, loading, error }: SystemHealthProps) => {
  const isHealthy = data && data.connected_mailboxes > 0;

  return (
    <BaseChart
      title="System Health"
      description="Current system status and resources"
      isLoading={loading}
      error={error}
      className="col-span-1 md:col-span-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mailbox Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mailbox Status</CardTitle>
            {isHealthy ? (
              <div className="flex items-center">
                <Wifi className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-500">Online</span>
              </div>
            ) : (
              <div className="flex items-center">
                <WifiOff className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-red-500">Offline</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Connected Mailboxes</span>
                  <span className="text-lg font-bold">{data?.connected_mailboxes || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isHealthy ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: isHealthy ? '100%' : '30%' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : data?.email_templates || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        {/* Email Contents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Contents</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : data?.email_contents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Saved contents</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="mt-4 p-4 bg-muted/10 rounded-md">
        <div className="flex items-center space-x-2">
          {isHealthy ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          <h4 className="font-medium">
            {isHealthy ? 'All systems operational' : 'Action required'}
          </h4>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isHealthy 
            ? 'Your system is running smoothly with all services operational.'
            : 'Connect a mailbox to start sending emails.'
          }
        </p>
      </div>
    </BaseChart>
  );
};
