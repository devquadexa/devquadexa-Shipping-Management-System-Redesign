# Petty Cash Balance Management Feature - Implementation Summary

## Overview

Added "Collect Overdue" and "Return Balance" buttons to the **JobPettyCash** component to allow Waff Clerk users to manage balance returns and overdue collection requests directly from the job's expanded petty cash section.

## Changes Made

### 1. State Variables Added (JobPettyCash.js)

```javascript
const [showBalanceModal, setShowBalanceModal] = useState(false);
const [balanceAction, setBalanceAction] = useState(null); // 'BALANCE_RETURN' or 'OVERDUE_COLLECTION'
const [balanceNotes, setBalanceNotes] = useState('');
```

**Purpose:**
- `showBalanceModal`: Controls visibility of the balance return/overdue collection modal
- `balanceAction`: Tracks which action is being performed
- `balanceNotes`: Stores optional notes for the request

### 2. New Handler Function: `handleBalanceSubmit()`

```javascript
const handleBalanceSubmit = async () => {
  // Validates balance amount
  // Posts to /api/cash-balance-settlements with:
  // - assignmentId
  // - settlementType ('BALANCE_RETURN' or 'OVERDUE_COLLECTION')
  // - amount (absolute value)
  // - notes
  // Refreshes assignments on success
  // Shows appropriate success/error messages
}
```

### 3. Action Buttons in Expanded Assignment Row

#### Return Balance Button
- **Visibility Conditions:**
  - Balance > 0 (positive balance available)
  - Assignment status in: `['Settled', 'Balance To Be Return', 'Settled/Approved', 'Balance Returned']`
  - User is Waff Clerk
  - User is assigned to this petty cash assignment
- **Styling:** Green button (bg-green-600)
- **Label:** "Return Balance"

#### Collect Overdue Button
- **Visibility Conditions:**
  - Balance < 0 (negative balance / overdue amount)
  - Assignment status in: `['Settled', 'Over Due', 'Settled/Approved', 'Overdue Collected']`
  - User is Waff Clerk
  - User is assigned to this petty cash assignment
- **Styling:** Amber button (bg-amber-600)
- **Label:** "Collect Overdue"

### 4. Balance/Overdue Modal

**Header:**
- Emoji icon (💰 for Return Balance, 📋 for Collect Overdue)
- Title indicating the action type
- Assigned user name

**Content:**
- Amount display section (green for balance return, red for overdue collection)
- Shows the balance/overdue amount to be processed
- Shows original assigned amount for reference
- Optional notes textarea (max 500 characters)
- Success/error messages

**Actions:**
- Cancel button (gray)
- Submit button (green for balance return, amber for overdue collection)
- Button labels: "Request Balance Return" or "Request Overdue Collection"

## User Workflows

### Scenario 1: Return Balance
1. Waff Clerk expands a petty cash assignment
2. Assignment shows positive balance (e.g., LKR 1,000.00)
3. Assignment status is "Settled"
4. Green "Return Balance" button appears
5. Click button → Modal opens
6. Modal shows amount to return
7. Optional notes can be added
8. Click "Request Balance Return" button
9. Request submitted to `/api/cash-balance-settlements` with type `'BALANCE_RETURN'`
10. Assignment status updates (typically to "Balance Returned")
11. Manager reviews and approves/rejects the request in Management Settlement page

### Scenario 2: Collect Overdue
1. Waff Clerk expands a petty cash assignment
2. Assignment shows negative balance (e.g., LKR -500.00 overspend)
3. Assignment status is "Over Due"
4. Amber "Collect Overdue" button appears
5. Click button → Modal opens
6. Modal shows overdue amount to collect (absolute value)
7. Optional notes can be added
8. Click "Request Overdue Collection" button
9. Request submitted to `/api/cash-balance-settlements` with type `'OVERDUE_COLLECTION'`
10. Assignment status updates (typically to "Overdue Collected")
11. Manager reviews and approves/rejects the request in Management Settlement page

## API Integration

### Endpoint Used
```
POST /api/cash-balance-settlements
```

### Request Payload
```javascript
{
  assignmentId: number,
  settlementType: 'BALANCE_RETURN' | 'OVERDUE_COLLECTION',
  amount: number,          // LKR amount
  notes: string           // Optional notes
}
```

### Response
- Success: 201 status, settlement record created
- Error: Appropriate HTTP status with error message

## Technical Details

### File Modified
- `frontend/src/components/JobPettyCash.js`

### Dependencies
- `apiClient` - for API calls to `/cash-balance-settlements`
- `isClerkRole()` - from `pettyCashUtils.js` to verify Waff Clerk role
- `formatCurrency()` - for displaying LKR amounts

### Component Props
No new props required. Uses existing:
- `job` - for job context
- `users` - for user information
- `onUpdate` - callback to refresh parent after changes

## Display Logic

### Balance Calculation
```
balance = totalAssigned - totalSettled
```

### Button Visibility Rules
```
Return Balance Button:
  IF balance > 0 AND
     status IN ['Settled', 'Balance To Be Return', 'Settled/Approved', 'Balance Returned'] AND
     user is Waff Clerk AND
     user.userId === assignment.assignedTo
  THEN show button

Collect Overdue Button:
  IF balance < 0 AND
     status IN ['Settled', 'Over Due', 'Settled/Approved', 'Overdue Collected'] AND
     user is Waff Clerk AND
     user.userId === assignment.assignedTo
  THEN show button
```

## Build Status

✅ **Build Successful** - Project builds without errors
- Build size: 184.73 kB (gzipped)
- No new dependencies required
- Warnings are pre-existing (not from this change)

## Testing Recommendations

### Manual Testing
1. **As Waff Clerk with balance to return:**
   - Navigate to a job with settled petty cash assignment
   - Expand the assignment showing positive balance
   - Click "Return Balance" button
   - Modal should display balance amount in green
   - Submit request and verify assignment status updates

2. **As Waff Clerk with overdue amount:**
   - Navigate to a job with overdue petty cash assignment
   - Expand the assignment showing negative balance
   - Click "Collect Overdue" button
   - Modal should display overdue amount in red
   - Submit request and verify assignment status updates

3. **As Admin/Manager:**
   - Verify "Return Balance" and "Collect Overdue" buttons do NOT appear
   - Verify role-based access control is enforced

4. **As Manager (on Management Settlement page):**
   - Verify submitted requests appear for approval
   - Test approve/reject workflows

### Edge Cases
- Clicking button with balance = 0 (should show error message)
- Network errors during submission
- Modal state cleanup after cancel
- Message auto-dismiss timing (3-4 seconds)

## Integration Points

This feature integrates with:
1. **JobPettyCash Component** - Displays buttons and modals
2. **Cash Balance Settlement API** - Creates settlement requests
3. **Management Settlement Page** - Reviews/approves requests
4. **PettyCash Page** - Standalone view (unaffected)
5. **Jobs Page** - Parent component (calls onUpdate callback)

## Notes

- Feature is **read-only** for Admin/Manager roles (no buttons shown)
- Feature is **only for Waff Clerks** assigned to the specific petty cash assignment
- Requests go through approval workflow (not auto-approved)
- Feature respects existing role-based access control patterns
- Error messages auto-dismiss after 4 seconds
- Success messages auto-dismiss after 3 seconds
