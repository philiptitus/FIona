import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile - Fiona",
  description: "Manage your user profile and preferences",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
