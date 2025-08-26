# User Details Tab Navigation URLs

The UserDetailsPage now supports URL-based tab navigation similar to AccountDetailsPage.

## URL Examples

### Default tab (User Details)
- URL: `/users/123`
- URL: `/users/123?tab=details`

### Messages tab  
- URL: `/users/123?tab=messages`

### Related Accounts tab
- URL: `/users/123?tab=accounts` 

### History tab
- URL: `/users/123?tab=history`

### Password Reset tab
- URL: `/users/123?tab=password`

## Features

1. **URL Persistence**: Tab selection is saved in the URL query parameter
2. **Browser Back/Forward**: Users can navigate back/forward through tab history
3. **Direct Links**: Users can share direct links to specific tabs
4. **Page Refresh**: Tab selection survives page refreshes
5. **Default Behavior**: No query parameter defaults to the first tab (details)

## Implementation Details

- Uses React Router's `useSearchParams` hook
- Tab names are mapped to URL-friendly strings in `TAB_NAMES` array
- `handleTabChange` function updates both local state and URL
- `useEffect` syncs tab state with URL changes
- Similar implementation to `AccountDetailsPage`
