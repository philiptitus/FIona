import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Content - Fiona",
  description: "Manage your email content and assets",
}

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
