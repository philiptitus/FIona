import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inbox - Fiona",
  description: "Manage your email inbox and responses",
}

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
