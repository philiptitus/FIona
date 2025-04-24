"use client"

import { useEffect } from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import type { RootState, AppDispatch } from "@/store/store"

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { campaigns, isLoading } = useSelector((state: RootState) => state.campaigns)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(handleFetchCampaigns())
  }, [dispatch])

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 px-4 md:px-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}! Here&apos;s an overview of your email
              campaigns.
            </p>
          </div>
          <Button asChild>
            <Link href="/campaigns/new">Create New Campaign</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : campaigns.length}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,482</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.5%</div>
              <p className="text-xs text-muted-foreground">+7% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.8%</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Email Performance</CardTitle>
                  <CardDescription>Email open and click rates over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] flex items-center justify-center">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Performance chart will appear here</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Campaign Distribution</CardTitle>
                  <CardDescription>Breakdown by campaign type</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] flex items-center justify-center">
                    <PieChart className="h-16 w-16 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Distribution chart will appear here</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>In-depth analysis of your email campaigns</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[400px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Analytics will appear here</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Reports</CardTitle>
                <CardDescription>Downloadable reports and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Monthly Performance Report</h3>
                    <p className="text-sm text-muted-foreground">Last generated: April 10, 2025</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Download PDF
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Campaign Effectiveness Analysis</h3>
                    <p className="text-sm text-muted-foreground">Last generated: April 5, 2025</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Download PDF
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Audience Engagement Metrics</h3>
                    <p className="text-sm text-muted-foreground">Last generated: April 1, 2025</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
