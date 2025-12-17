import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Emails - Fiona",
  description: "Manage and track your email communications",
}

export default function EmailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
