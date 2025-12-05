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
  onMailboxChange: (mailboxId: number) => void
}

export default function MailboxSelector({
  mailboxes,
  selectedMailboxId,
  onMailboxChange,
}: MailboxSelectorProps) {
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <Mail className="h-5 w-5 text-primary hidden sm:block" />
      <Select
        value={selectedMailboxId?.toString()}
        onValueChange={(value) => onMailboxChange(parseInt(value))}
      >
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue placeholder="Select a mailbox" />
        </SelectTrigger>
        <SelectContent>
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
