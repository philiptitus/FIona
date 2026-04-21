"use client"

import { Mailbox } from "@/store/slices/mailboxSlice"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail } from "lucide-react"

interface MailboxSelectorProps {
  mailboxes: Mailbox[]
  selectedMailboxId: number | null
  onMailboxChange: (mailboxId: number | null) => void
}

export default function MailboxSelector({
  mailboxes,
  selectedMailboxId,
  onMailboxChange,
}: MailboxSelectorProps) {
  // Use special ID -1 for "All Messages"
  const displayValue = selectedMailboxId === null ? "-1" : selectedMailboxId?.toString()

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <Mail className="h-5 w-5 text-primary hidden sm:block" />
      <Select
        value={displayValue}
        onValueChange={(value) => onMailboxChange(value === "-1" ? null : parseInt(value))}
      >
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue placeholder="Select a mailbox" />
        </SelectTrigger>
        <SelectContent>
          {/* All Messages Option */}
          <SelectItem value="-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="truncate font-medium">All Messages</span>
            </div>
          </SelectItem>
          
          {/* Individual Mailboxes */}
          {mailboxes.map((mailbox) => (
            <SelectItem key={mailbox.id} value={mailbox.id.toString()}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="truncate">{mailbox.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
        }