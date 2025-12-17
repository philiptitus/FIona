import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email Sending - Fiona",
  description: "Send and schedule your email campaigns",
}

export default function EmailSendingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
