import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Research - Fiona",
  description: "Research and analyze your campaign performance",
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
