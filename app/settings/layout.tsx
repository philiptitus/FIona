import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings - Fiona",
  description: "Configure your account and application settings",
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
