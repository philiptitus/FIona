import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Companies - Fiona",
  description: "Manage your company contacts and information",
}

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
