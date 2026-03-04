# SentEmail API Changes

## SentEmailListView - Pagination Update

### Before
```
GET /mail/sent-emails/

Response: All results returned in a single response (no pagination)
{
    "results": [
        { ... },
        { ... },
        ...
    ]
}
```

### After
```
GET /mail/sent-emails/?page=1

Response: Paginated results, 10 items per page
{
    "count": 245,
    "next": "http://api.example.com/sent-emails/?page=2",
    "previous": null,
    "results": [
        { ... },
        { ... },
        ...
        (10 items)
    ]
}
```

**Changes:**
- Pagination enabled with `FixedPageNumberPagination`
- Default page size: 10 items
- Page size cannot be overridden via query parameters
- Supports `?page=N` parameter to navigate pages
