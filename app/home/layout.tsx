import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FionaAI - Email Campaign Management",
  description: "Powerful AI-driven email campaign management platform",
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
