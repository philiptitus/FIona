import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Campaigns - Fiona",
  description: "Create and manage your email campaigns",
}

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
