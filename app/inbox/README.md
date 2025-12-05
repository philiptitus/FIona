# Inbox Feature

## Overview
A comprehensive Gmail-like inbox interface that provides read-only access to connected mailboxes. Built with a responsive design that works seamlessly across mobile, tablet, and desktop devices.

## Features Implemented

### 1. **Mailbox Management**
- Switch between multiple connected mailboxes
- View mailbox profile statistics
- Real-time mailbox status indicators

### 2. **Inbox View**
- Paginated message list with next/previous navigation
- Search functionality for filtering messages
- Visual indicators for read/unread messages
- Important message highlighting with star icons
- Message preview with snippets
- Quick access to conversation threads

### 3. **Message Details**
- Full message display with decoded body content
- Complete header information (From, To, Date, Subject)
- Label badges for message categorization
- Technical details accordion (Message ID, Thread ID, Size, Internal Date)
- All headers viewer with scroll area
- Direct link to view conversation thread

### 4. **Thread View**
- Complete conversation history in chronological order
- Expandable/collapsible message cards
- Auto-expand last message in thread
- Avatar fallbacks with email initials
- Message count badge
- Individual message details within thread

### 5. **Labels Sidebar**
- System labels (INBOX, SENT, DRAFT, TRASH, STARRED, etc.)
- Custom user-created labels
- Icon representations for common label types
- Label count badge

### 6. **Mailbox Statistics**
- Total messages count
- Total threads count
- Mailbox connection date
- History ID tracking
- Visual stat cards with gradient backgrounds

## File Structure

```
app/inbox/
├── page.tsx                          # Main inbox page with layout orchestration
└── components/
    ├── MailboxSelector.tsx           # Dropdown to switch between mailboxes
    ├── InboxMessageList.tsx          # Paginated list of inbox messages
    ├── MessageDetails.tsx            # Full message viewer with details
    ├── ThreadView.tsx                # Conversation thread viewer
    ├── LabelsSidebar.tsx            # Gmail labels sidebar
    └── MailboxStats.tsx             # Mailbox profile statistics
```

## Redux Integration

### Actions (store/actions/mailboxActions.ts)
- `fetchMailboxInbox` - Get inbox messages with pagination
- `fetchMailboxLabels` - Get all labels for a mailbox
- `fetchMessageDetails` - Get full message details
- `fetchThreadDetails` - Get complete conversation thread
- `fetchMailboxProfile` - Get mailbox statistics

### State (store/slices/mailboxSlice.ts)
- `inbox` - Current inbox data with messages and pagination
- `labels` - Mailbox labels (system and user)
- `currentMessage` - Currently viewed message details
- `currentThread` - Currently viewed thread details
- `mailboxProfile` - Mailbox profile and statistics

## Component Props

### MailboxSelector
```typescript
{
  mailboxes: Mailbox[]
  selectedMailboxId: number | null
  onMailboxChange: (mailboxId: number) => void
}
```

### InboxMessageList
```typescript
{
  mailboxId: number
  onMessageSelect: (messageId: string) => void
  onThreadSelect: (threadId: string) => void
}
```

### MessageDetails
```typescript
{
  mailboxId: number
  messageId: string
  onBack: () => void
  onThreadSelect: (threadId: string) => void
}
```

### ThreadView
```typescript
{
  mailboxId: number
  threadId: string
  onBack: () => void
}
```

### LabelsSidebar
```typescript
{
  mailboxId: number
}
```

### MailboxStats
```typescript
{
  mailboxId: number
}
```

## Responsive Design

### Mobile (< 640px)
- Full-width components
- Stacked layout
- Hidden labels sidebar when viewing message/thread
- Simplified navigation with icons only
- Touch-optimized interface

### Tablet (640px - 1024px)
- 2-column grid for stats
- Optimized spacing
- Visible labels sidebar
- Balanced layout

### Desktop (> 1024px)
- 4-column grid for stats
- Side-by-side labels and content
- Full navigation labels
- Maximum screen real estate utilization

## Loading States

All components implement proper loading states:
- Skeleton loaders for content
- Spinning refresh icons
- Disabled buttons during loading
- Loading indicators for async operations

## Error Handling

- Graceful error displays with Alert components
- User-friendly error messages
- Retry mechanisms (refresh buttons)
- Fallback UI for empty states

## Navigation Flow

1. **Landing** → Select mailbox from dropdown
2. **Inbox View** → Click message to view details
3. **Message Details** → View full message or click "View Thread"
4. **Thread View** → See complete conversation
5. **Back Navigation** → Return to inbox from any view

## Empty States

- No mailboxes connected → Prompt to connect in settings
- No messages in inbox → "Inbox is empty" message
- No search results → "Try adjusting your search query"
- No labels found → "No labels found" message

## Features Highlights

### Smart Pagination
- Configurable limit (default: 25 messages)
- Next/Previous buttons with disable states
- Page token management for Gmail API

### Base64 Decoding
- Automatic decoding of message bodies
- URL-safe character handling
- Error handling for decode failures

### Label Icons
- System label icon mapping
- Custom label fallback icons
- Visual label categorization

### Thread Detection
- Automatic thread identification
- Quick thread view access from messages
- Thread message count display

### Search & Filter
- Real-time search across message snippets
- Case-insensitive matching
- Instant results

## Navigation Integration

The inbox is accessible from the sidebar with an "Inbox" link (with Inbox icon) positioned right after the Dashboard link.

## Future Enhancements

Potential features for future development:
- Label filtering in inbox view
- Compose new messages
- Reply to messages
- Archive/delete actions
- Attachment viewer
- Mark as read/unread
- Search across all fields (not just snippets)
- Advanced filters
- Keyboard shortcuts
- Bulk actions
