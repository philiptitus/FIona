# Bulk Research Feature Implementation

## Overview
Added bulk research functionality to Companies and Email Lists pages, allowing users to select multiple contacts (up to 10) and trigger personalized research generation for all selected contacts at once.

## Files Created

### 1. Redux State Management
- **`store/slices/selectedContactsSlice.ts`**
  - Tracks selected contact IDs across pagination
  - Separate state for `emaillist` and `company` types
  - Actions: `toggleContact`, `selectMultiple`, `deselectMultiple`, `clearSelection`

### 2. API Integration
- **`store/actions/researchActions.ts`** (modified)
  - Added `BulkResearchParams` interface
  - Added `startBulkResearch` async thunk
  - Added `handleStartBulkResearch` handler function
  - Sends: `{ contact_ids: number[], contact_type: string, create_campaign: boolean }`

### 3. UI Components
- **`components/research/BulkResearchConfirmationModal.tsx`**
  - Confirmation dialog before triggering bulk research
  - Shows selected contact names (up to 10, then "... and X more")
  - Checkbox for `create_campaign` option (defaults to false)
  - Loading state during submission

- **`components/research/BulkResearchFloatingBar.tsx`**
  - Floating action bar at bottom of screen
  - Shows selected count with visual indicator
  - "Research Selected" button (disabled if > 10 selected)
  - "Clear" button to deselect all
  - Warning message if over limit

- **`components/research/useBulkResearch.ts`**
  - Reusable hook for bulk research logic
  - Handles selection state, API calls, navigation
  - Returns all necessary functions and state for components

### 4. Page Updates
- **`app/companies/page.tsx`** (modified)
  - Added checkbox to each company card (top-left corner)
  - Added "Select all on this page" checkbox above cards
  - Integrated floating bar and confirmation modal
  - Selection persists across pagination

- **`app/email-lists/page.tsx`** (completely rewritten)
  - Full implementation with contact list selector
  - Search functionality
  - Pagination (20 items per page)
  - Checkbox selection for each email contact
  - "Select all on this page" functionality
  - Integrated floating bar and confirmation modal

## User Flow

1. **Selection Phase**
   - User navigates to Companies or Email Lists page
   - User selects contacts via checkboxes (individual or "select all on page")
   - Selection persists when navigating between pages
   - Floating bar appears showing count and actions

2. **Trigger Phase**
   - User clicks "Research Selected" button
   - Confirmation modal opens showing:
     - List of selected contact names
     - Checkbox for "Create campaign after research" (default: unchecked)
     - Estimated time and info
   - User confirms or cancels

3. **Processing Phase**
   - API call sent with `{ contact_ids, contact_type, create_campaign }`
   - Toast notification confirms research started
   - Selected contacts are cleared
   - User is redirected to `/research` page
   - `GlobalResearchProcessingBanner` tracks progress (existing functionality)

## Technical Details

### API Endpoint
- **POST** `/mail/agents/personalized-research/`
- **Payload**: 
  ```json
  {
    "contact_ids": [123, 456, 789],
    "contact_type": "emaillist" | "company",
    "create_campaign": false
  }
  ```

### Constraints
- Maximum 10 contacts per bulk research request
- "Research Selected" button disabled if > 10 selected
- Warning message shown when over limit

### State Management
- Selection state stored in Redux (`selectedContacts` slice)
- Separate arrays for `emaillist` and `company` types
- Selection cleared after successful research trigger
- Selection persists across pagination within same session

## Backward Compatibility
- ✅ Single contact research from detail pages unchanged
- ✅ Existing research flow unchanged
- ✅ All existing components and pages work as before
- ✅ New bulk research is completely separate code path

## Future Enhancements (Not Implemented)
- Research page handling for bulk results (discussed later)
- Bulk research progress tracking per contact
- Ability to cancel individual researches in bulk
- Export selected contacts
- Save selection as a list

## Testing Checklist
- [ ] Select individual contacts on Companies page
- [ ] Select all on page works correctly
- [ ] Selection persists across pagination
- [ ] Floating bar appears/disappears correctly
- [ ] Button disabled when > 10 selected
- [ ] Confirmation modal shows correct contact names
- [ ] create_campaign checkbox works
- [ ] API call sends correct payload
- [ ] Success: redirects to /research page
- [ ] Success: selection is cleared
- [ ] Success: toast notification shown
- [ ] Error: error message displayed
- [ ] Same tests for Email Lists page
