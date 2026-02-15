**User Settings API (Brief)**

- **Endpoint:** /mail/user-settings/
- **Methods:** GET, PUT
- **Auth:** Requires authentication (DRF `IsAuthenticated`) — session or token-based auth is acceptable.
- **Purpose:** Retrieve or update the calling user's per-user AI generation word-limit settings.

**Request (GET)**
- Returns the current user's settings.

Example response:
```
{
  "id": 12,
  "user": 4,
  "default_email_word_limit": 100,
  "default_template_word_limit": 100,
  "sequence_initial": 100,
  "sequence_followup": 70,
  "sequence_final": 50,
  "created_at": "2026-02-16T12:00:00Z",
  "updated_at": "2026-02-16T12:00:00Z"
}
```

**Request (PUT)**
- Update one or more fields. Partial updates are allowed via PUT on the same endpoint (body should contain only fields to change).

Example payload:
```
{
  "default_email_word_limit": 120,
  "sequence_followup": 80
}
```

Example successful response: returns the updated object (same shape as GET response).

**Fields**
- **default_email_word_limit:** integer — default word limit used when generating emails.
- **default_template_word_limit:** integer — default word limit for generated templates.
- **sequence_initial:** integer — word limit for initial sequence email.
- **sequence_followup:** integer — word limit for follow-up sequence email.
- **sequence_final:** integer — word limit for final sequence email.

**Errors**
- 401 Unauthorized — when not authenticated.
- 400 Bad Request — invalid field types or values.

**Notes**
- The endpoint only allows the authenticated user to read/update their own settings.
- The model defaults mirror `mail/word_counts.py` defaults.
- After changes, code paths that generate email content will use these values when available.

**Quick curl (example)**
```
curl -H "Authorization: Token <TOKEN>" \
     -H "Content-Type: application/json" \
     -X PUT \
     -d '{"default_email_word_limit":90}' \
     https://<your-host>/mail/user-settings/
```
