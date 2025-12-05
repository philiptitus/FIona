# Mailbox Read API Documentation

## Overview
The Mailbox Read API provides read-only access to user's Gmail mailboxes using the `gmail.readonly` OAuth scope. These endpoints allow you to retrieve inbox messages, labels, message details, conversation threads, and mailbox profile information.

**Base URL:** `/mail/`

All endpoints require authentication and operate on the authenticated user's mailboxes.

---

## Authentication
All endpoints require:
- **Header:** `Authorization: Bearer {access_token}`
- **Method:** Token-based authentication (Django REST Framework)

---

## Endpoints

### 1. Get Mailbox Inbox

Retrieve messages from the user's Gmail inbox with pagination support.

**URL:** `/mail/mailboxes/<mailbox_id>/inbox/`

**Method:** `GET`

**Authentication:** Required ✓

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `mailbox_id` | integer | The ID of the mailbox (retrieved from mailbox list endpoint) |

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | integer | 10 | 100 | Number of messages to fetch per page |
| `page_token` | string | null | - | Token for pagination to fetch next set of results |

**Example Request:**
```bash
GET /mail/mailboxes/1/inbox/?limit=25&page_token=null
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "messages": [
    {
      "id": "18a0b0a7bcab1234",
      "threadId": "18a0b0a7bcab1234",
      "labelIds": ["INBOX", "IMPORTANT"]
    },
    {
      "id": "18a0b0a7bcab5678",
      "threadId": "18a0b0a7bcab5678",
      "labelIds": ["INBOX"]
    }
  ],
  "nextPageToken": "02348567890abcdef",
  "total": 250,
  "mailbox": "user@gmail.com"
}
```

**Error Responses:**

```json
// 404 - Mailbox not found
{
  "error": "Mailbox not found"
}
```

```json
// 401 - Token expired
{
  "error": "Mailbox token expired. Please re-authenticate."
}
```

```json
// 400 - API error
{
  "error": "Failed to fetch inbox: {error_details}"
}
```

---

### 2. Get Mailbox Labels

Retrieve all labels configured in the user's Gmail account.

**URL:** `/mail/mailboxes/<mailbox_id>/labels/`

**Method:** `GET`

**Authentication:** Required ✓

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `mailbox_id` | integer | The ID of the mailbox |

**Query Parameters:** None

**Example Request:**
```bash
GET /mail/mailboxes/1/labels/
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "labels": [
    {
      "id": "INBOX",
      "name": "INBOX",
      "messageListVisibility": "hide",
      "labelListVisibility": "labelShow",
      "type": "system"
    },
    {
      "id": "DRAFT",
      "name": "DRAFT",
      "messageListVisibility": "hide",
      "labelListVisibility": "labelShow",
      "type": "system"
    },
    {
      "id": "Label_123",
      "name": "Project Alpha",
      "messageListVisibility": "labelShow",
      "labelListVisibility": "labelShow",
      "type": "user"
    },
    {
      "id": "Label_456",
      "name": "Clients",
      "messageListVisibility": "labelShow",
      "labelListVisibility": "labelShow",
      "type": "user"
    }
  ],
  "mailbox": "user@gmail.com",
  "total": 4
}
```

**Error Responses:**

```json
// 404 - Mailbox not found
{
  "error": "Mailbox not found"
}
```

```json
// 401 - Token expired
{
  "error": "Mailbox token expired. Please re-authenticate."
}
```

```json
// 400 - API error
{
  "error": "Failed to fetch labels: {error_details}"
}
```

---

### 3. Get Message Details

Retrieve the full details of a specific email message including headers, body content, and attachments.

**URL:** `/mail/mailboxes/<mailbox_id>/message/<message_id>/`

**Method:** `GET`

**Authentication:** Required ✓

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `mailbox_id` | integer | The ID of the mailbox |
| `message_id` | string | The Gmail message ID |

**Query Parameters:** None

**Example Request:**
```bash
GET /mail/mailboxes/1/message/18a0b0a7bcab1234/
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "message": {
    "id": "18a0b0a7bcab1234",
    "threadId": "18a0b0a7bcab1234",
    "labelIds": ["INBOX"],
    "snippet": "Hey! Just checking in on the project status...",
    "payload": {
      "mimeType": "text/plain",
      "filename": "",
      "headers": [
        {
          "name": "Return-Path",
          "value": "<sender@example.com>"
        },
        {
          "name": "Received",
          "value": "from mail-ed1-x234.google.com ([2607:f8b0:4864:20::234])"
        },
        {
          "name": "MIME-Version",
          "value": "1.0"
        },
        {
          "name": "From",
          "value": "sender@example.com"
        },
        {
          "name": "Date",
          "value": "Thu, 5 Dec 2024 10:30:00 +0000"
        },
        {
          "name": "Message-ID",
          "value": "<CADcZZ5Z+abc123@mail.gmail.com>"
        },
        {
          "name": "Subject",
          "value": "Project Update - Q4 Planning"
        },
        {
          "name": "To",
          "value": "recipient@example.com"
        },
        {
          "name": "Content-Type",
          "value": "text/plain; charset=\"UTF-8\""
        }
      ],
      "body": {
        "size": 1234,
        "data": "SGV5ISBJDSJDKSJDK..."  // base64 encoded
      },
      "parts": [
        {
          "mimeType": "text/plain",
          "filename": "",
          "body": {
            "size": 1234,
            "data": "SGV5ISBJDSJDKSJDK..."
          }
        }
      ]
    },
    "sizeEstimate": 2340,
    "historyId": "12345678",
    "internalDate": "1733383800000"
  },
  "mailbox": "user@gmail.com"
}
```

**Error Responses:**

```json
// 404 - Mailbox not found
{
  "error": "Mailbox not found"
}
```

```json
// 404 - Message not found
{
  "error": "Message not found"
}
```

```json
// 401 - Token expired
{
  "error": "Mailbox token expired. Please re-authenticate."
}
```

```json
// 400 - API error
{
  "error": "Failed to fetch message: {error_details}"
}
```

---

### 4. Get Thread Details

Retrieve a complete conversation thread with all associated messages.

**URL:** `/mail/mailboxes/<mailbox_id>/thread/<thread_id>/`

**Method:** `GET`

**Authentication:** Required ✓

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `mailbox_id` | integer | The ID of the mailbox |
| `thread_id` | string | The Gmail thread ID |

**Query Parameters:** None

**Example Request:**
```bash
GET /mail/mailboxes/1/thread/18a0b0a7bcab1234/
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "thread": {
    "id": "18a0b0a7bcab1234",
    "historyId": "12345678",
    "messages": [
      {
        "id": "18a0b0a7bcab1234",
        "threadId": "18a0b0a7bcab1234",
        "labelIds": ["INBOX"],
        "snippet": "Initial inquiry about pricing...",
        "payload": {
          "headers": [
            {
              "name": "From",
              "value": "client@example.com"
            },
            {
              "name": "Subject",
              "value": "Pricing Inquiry"
            },
            {
              "name": "Date",
              "value": "Wed, 4 Dec 2024 09:00:00 +0000"
            }
          ],
          "body": {
            "data": "..."
          }
        },
        "sizeEstimate": 1500,
        "internalDate": "1733289600000"
      },
      {
        "id": "18a0b0a7bcab5678",
        "threadId": "18a0b0a7bcab1234",
        "labelIds": ["INBOX"],
        "snippet": "Thanks for your inquiry! Here are our pricing...",
        "payload": {
          "headers": [
            {
              "name": "From",
              "value": "sales@company.com"
            },
            {
              "name": "Subject",
              "value": "Re: Pricing Inquiry"
            },
            {
              "name": "Date",
              "value": "Wed, 4 Dec 2024 10:30:00 +0000"
            }
          ],
          "body": {
            "data": "..."
          }
        },
        "sizeEstimate": 2100,
        "internalDate": "1733293800000"
      }
    ]
  },
  "mailbox": "user@gmail.com",
  "message_count": 2
}
```

**Error Responses:**

```json
// 404 - Mailbox not found
{
  "error": "Mailbox not found"
}
```

```json
// 404 - Thread not found
{
  "error": "Thread not found"
}
```

```json
// 401 - Token expired
{
  "error": "Mailbox token expired. Please re-authenticate."
}
```

```json
// 400 - API error
{
  "error": "Failed to fetch thread: {error_details}"
}
```

---

### 5. Get Mailbox Profile

Retrieve profile information about the mailbox including message statistics.

**URL:** `/mail/mailboxes/<mailbox_id>/profile/`

**Method:** `GET`

**Authentication:** Required ✓

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `mailbox_id` | integer | The ID of the mailbox |

**Query Parameters:** None

**Example Request:**
```bash
GET /mail/mailboxes/1/profile/
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "email": "user@gmail.com",
  "messages_total": 4532,
  "threads_total": 2891,
  "history_id": "12345678",
  "mailbox_linked_at": "2024-11-15T10:30:00Z"
}
```

**Error Responses:**

```json
// 404 - Mailbox not found
{
  "error": "Mailbox not found"
}
```

```json
// 401 - Token expired
{
  "error": "Mailbox token expired. Please re-authenticate."
}
```

```json
// 400 - API error
{
  "error": "Failed to fetch profile: {error_details}"
}
```

---

## Common HTTP Status Codes

| Status Code | Meaning | Scenario |
|------------|---------|----------|
| 200 | OK | Request successful, data returned |
| 400 | Bad Request | Invalid parameters or API error |
| 401 | Unauthorized | Token expired or invalid, re-authentication needed |
| 404 | Not Found | Mailbox, message, or thread not found |
| 500 | Internal Server Error | Server-side error |

---

## Error Handling Guide

### Token Expiration (401)
When you receive a 401 response, the mailbox token has expired. The user needs to re-authenticate:

```javascript
if (response.status === 401) {
  // Redirect user to Gmail re-authentication
  window.location.href = '/mail/gmail/start/';
}
```

### Mailbox Not Found (404)
Ensure the `mailbox_id` is valid and belongs to the authenticated user. Retrieve mailbox list from `/mail/mailboxes/`.

### Invalid Message/Thread IDs
Ensure the `message_id` or `thread_id` are valid Gmail IDs. These typically are long alphanumeric strings.

---

## Frontend Integration Examples

### JavaScript/Fetch

#### Get Inbox Messages
```javascript
const mailboxId = 1;
const limit = 25;

fetch(`/mail/mailboxes/${mailboxId}/inbox/?limit=${limit}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Inbox messages:', data.messages);
  console.log('Total:', data.total);
  if (data.nextPageToken) {
    // Load next page
    loadNextPage(data.nextPageToken);
  }
})
.catch(error => console.error('Error:', error));
```

#### Get Message Details
```javascript
const mailboxId = 1;
const messageId = '18a0b0a7bcab1234';

fetch(`/mail/mailboxes/${mailboxId}/message/${messageId}/`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  const messagePayload = data.message.payload;
  const body = atob(messagePayload.body.data); // Decode base64
  console.log('Message body:', body);
})
.catch(error => console.error('Error:', error));
```

#### Get Thread Conversation
```javascript
const mailboxId = 1;
const threadId = '18a0b0a7bcab1234';

fetch(`/mail/mailboxes/${mailboxId}/thread/${threadId}/`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Messages in thread:', data.message_count);
  data.thread.messages.forEach(msg => {
    const headers = msg.payload.headers;
    const from = headers.find(h => h.name === 'From').value;
    const subject = headers.find(h => h.name === 'Subject').value;
    const date = headers.find(h => h.name === 'Date').value;
    console.log(`From: ${from}, Subject: ${subject}, Date: ${date}`);
  });
})
.catch(error => console.error('Error:', error));
```

#### Get All Labels
```javascript
const mailboxId = 1;

fetch(`/mail/mailboxes/${mailboxId}/labels/`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  const userLabels = data.labels.filter(label => label.type === 'user');
  console.log('Custom labels:', userLabels);
})
.catch(error => console.error('Error:', error));
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function MailboxInbox({ mailboxId, accessToken }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const response = await fetch(
          `/mail/mailboxes/${mailboxId}/inbox/?limit=25`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 401) {
          // Token expired, trigger re-auth
          window.location.href = '/mail/gmail/start/';
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch inbox');
        }
        
        const data = await response.json();
        setMessages(data.messages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [mailboxId, accessToken]);

  if (loading) return <div>Loading inbox...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Inbox ({messages.length} messages)</h2>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>{msg.id}</li>
        ))}
      </ul>
    </div>
  );
}

export default MailboxInbox;
```

---

## Rate Limiting

Gmail API has rate limits. Be aware:
- Per user: 250,000 quota units per day
- Per second: 100 queries per second per user

---

## Best Practices

1. **Token Management:** Always handle 401 responses and redirect to re-authentication
2. **Pagination:** Use `page_token` to handle large result sets instead of increasing limit
3. **Caching:** Cache labels and profile info as they rarely change
4. **Error Handling:** Always implement try-catch and display meaningful error messages
5. **Base64 Decoding:** Message bodies in payloads are base64-encoded; decode them on the frontend
6. **Message IDs:** Store full Gmail message IDs; don't truncate them

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | User needs to re-authenticate via `/mail/gmail/start/` |
| 404 Not Found | Verify mailbox_id, message_id, or thread_id are correct |
| Empty messages array | Inbox may be empty or limit was too low |
| Base64 decode error | Ensure you're using proper base64 decoding library |
| CORS errors | This API should be called from backend; if frontend, ensure CORS is configured |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-05 | Initial release with 5 endpoints |

---

## Support

For issues or questions regarding the Mailbox Read API, contact the development team.
