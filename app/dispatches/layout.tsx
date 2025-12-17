import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dispatches - Fiona",
  description: "Manage your email dispatches and deliveries",
}

export default function DispatchesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
