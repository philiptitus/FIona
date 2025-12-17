import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Templates - Fiona",
  description: "Create and manage email templates",
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
