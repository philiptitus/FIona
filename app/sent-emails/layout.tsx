import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sent Emails - Fiona",
  description: "View your sent email history and analytics",
}

export default function SentEmailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
