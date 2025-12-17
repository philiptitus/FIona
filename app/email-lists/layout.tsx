import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email Lists - Fiona",
  description: "Create and manage your email contact lists",
}

export default function EmailListsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
