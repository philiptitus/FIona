import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Fiona",
  description: "View your campaign analytics and statistics",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
