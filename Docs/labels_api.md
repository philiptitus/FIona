# Labels API Documentation

## Overview
The Labels API allows users to manage and retrieve their contact labels. Labels are used to organize contacts and companies from bulk uploads.

---

## Endpoints

### List User Labels

**Endpoint:** `GET /mail/labels/`

**Description:** Retrieve all labels created by the authenticated user with pagination support.

**Authentication:** Required (Token/JWT)

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number for pagination | 1 |

**Response:** `200 OK`

```json
{
  "count": 5,
  "next": "/api/labels/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "norwaytours",
      "description": "Norway tourism companies",
      "created_at": "2026-03-01T10:30:00Z",
      "updated_at": "2026-03-01T10:30:00Z"
    },
    {
      "id": 2,
      "name": "tech-startups",
      "description": null,
      "created_at": "2026-02-28T15:45:00Z",
      "updated_at": "2026-02-28T15:45:00Z"
    }
  ]
}
```

**Response Fields:**
- `count`: Total number of labels for the user
- `next`: URL to the next page (null if no next page)
- `previous`: URL to the previous page (null if no previous page)
- `results`: Array of label objects

**Label Object:**
- `id`: Unique label identifier
- `name`: Label name (unique per user)
- `description`: Optional label description
- `created_at`: ISO 8601 timestamp when label was created
- `updated_at`: ISO 8601 timestamp when label was last updated

**Example Request:**
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  /api/labels/?page=1
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have permission to access labels

---

## How Labels Are Created

Labels are automatically created when you upload contacts (emails or companies) with a label parameter:

**When uploading emails:**
```json
{
  "label": "norwaytours",
  "emails": [...]
}
```

**When uploading companies:**
```json
{
  "label": "tech-startups",
  "companies": [...]
}
```

The label will be saved to your label collection if it doesn't already exist (duplicate labels are not created).

---

## Pagination

Results are paginated with a default page size. Use the `page` query parameter to navigate:

- `page=1` - First page of results
- `page=2` - Second page of results
- etc.

The `next` and `previous` fields in the response provide URLs for easy pagination navigation.
