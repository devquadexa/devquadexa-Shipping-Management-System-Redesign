# Petty Cash Balance Feature - Visual Guide

## Feature Overview

The "Collect Overdue and Return Balance" buttons now appear in the expanded petty cash assignment rows within the Job Page. This allows Waff Clerks to manage balance returns and overdue collections directly from the job context.

## User Interface Layout

### 1. Expanded Petty Cash Assignment Row

```
┌─────────────────────────────────────────────────────────────────┐
│ Wаff Clerk 02        LKR 10,000.00    Settled    Balance: LKR 0.00  ▲ │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Settlement Items                                                │
│  ├─ Vehicle Import Fee .......................... LKR 5,000.00    │
│  ├─ Port Charges ............................... LKR 2,500.00    │
│  ├─ Documentation Fee .......................... LKR 2,500.00    │
│                                                                   │
│  Action Buttons:                                                 │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐ │
│  │ Settle          │  │ 💰 Return Balance                    │ │
│  │                 │  │ (if balance > 0)                     │ │
│  └─────────────────┘  └──────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────┐                        │
│  │ 📋 Collect Overdue                   │                        │
│  │ (if balance < 0)                     │                        │
│  └──────────────────────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Return Balance Modal

When balance > 0 and Waff Clerk clicks "Return Balance":

```
┌──────────────────────────────────────────────────────┐
│ 💰 Return Balance                                    │
│ Wаff Clerk 02                                     × │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Balance to Return:     LKR 1,000.00            │ │
│  │ Assigned: LKR 10,000.00                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Notes (Optional)                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ Enter any additional notes...                  │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [Cancel]  [Request Balance Return]               │
└──────────────────────────────────────────────────────┘
```

### 3. Collect Overdue Modal

When balance < 0 and Waff Clerk clicks "Collect Overdue":

```
┌──────────────────────────────────────────────────────┐
│ 📋 Collect Overdue                                 × │
│ Wаff Clerk 02                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Overdue Amount to Collect: LKR 500.00         │ │
│  │ Assigned: LKR 10,000.00                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Notes (Optional)                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ Enter any additional notes...                  │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [Cancel]  [Request Overdue Collection]           │
└──────────────────────────────────────────────────────┘
```

## Button Visibility Logic

### Return Balance Button (Green)
```
VISIBLE IF:
  ✓ Balance > 0 (LKR 0.00)
  ✓ Status is one of: Settled, Balance To Be Return, Settled/Approved, Balance Returned
  ✓ User role is Waff Clerk
  ✓ User ID matches assignment's assignedTo field

EXAMPLE SCENARIOS (Button Visible):
  • Assignment: Settled, Balance: LKR 500.00 ✓
  • Assignment: Balance To Be Return, Balance: LKR 200.00 ✓
  • Assignment: Balance Returned, Balance: LKR 100.00 ✓

EXAMPLE SCENARIOS (Button Hidden):
  • Assignment: Assigned, Balance: LKR 500.00 ✗ (status not eligible)
  • Assignment: Settled, Balance: LKR -500.00 ✗ (balance is negative)
  • Assignment: Settled, Balance: LKR 0.00 ✗ (balance is zero)
  • Admin user viewing Settled assignment ✗ (not Waff Clerk)
```

### Collect Overdue Button (Amber)
```
VISIBLE IF:
  ✓ Balance < 0 (LKR 0.00 or less)
  ✓ Status is one of: Settled, Over Due, Settled/Approved, Overdue Collected
  ✓ User role is Waff Clerk
  ✓ User ID matches assignment's assignedTo field

EXAMPLE SCENARIOS (Button Visible):
  • Assignment: Over Due, Balance: LKR -500.00 ✓
  • Assignment: Settled, Balance: LKR -200.00 ✓
  • Assignment: Overdue Collected, Balance: LKR -100.00 ✓

EXAMPLE SCENARIOS (Button Hidden):
  • Assignment: Assigned, Balance: LKR -500.00 ✗ (status not eligible)
  • Assignment: Over Due, Balance: LKR 500.00 ✗ (balance is positive)
  • Assignment: Over Due, Balance: LKR 0.00 ✗ (balance is zero)
  • Admin user viewing Over Due assignment ✗ (not Waff Clerk)
```

## Color Scheme

### Balance Amount Display in Modal
- **Return Balance Modal:** Green text (text-green-600) — indicates funds to be received
- **Collect Overdue Modal:** Red text (text-red-600) — indicates funds to be paid

### Button Styling
- **Return Balance Button:** Green background (bg-green-600) with hover state (bg-green-700)
- **Collect Overdue Button:** Amber background (bg-amber-600) with hover state (bg-amber-700)
- **Cancel Button:** Gray background (bg-gray-300)

## Workflow Example: Return Balance

```
1. User (Waff Clerk) logs in
   ↓
2. Navigates to Jobs page
   ↓
3. Finds a job and expands it
   ↓
4. Expands petty cash assignment section
   ├─ Sees "Settle" button (if status = Assigned)
   ├─ Sees "Return Balance" button (if balance > 0 and status is eligible)
   └─ Sees "Collect Overdue" button (if balance < 0 and status is eligible)
   ↓
5. Clicks "Return Balance" button
   ↓
6. Modal appears showing:
   • Balance amount in green: LKR 1,000.00
   • Original assignment amount: LKR 10,000.00
   ↓
7. Optionally adds notes explaining the return
   ↓
8. Clicks "Request Balance Return" button
   ↓
9. Request sent to backend: /api/cash-balance-settlements
   {
     "assignmentId": 123,
     "settlementType": "BALANCE_RETURN",
     "amount": 1000.00,
     "notes": "Returned unused portion"
   }
   ↓
10. Success message displays for 3 seconds
    ✓ Balance return submitted successfully
   ↓
11. Assignment status updates (typically to "Balance Returned")
    ↓
12. Modal closes
   ↓
13. Manager reviews request in Management Settlement page
    ├─ Approves (updates assignment status permanently)
    └─ Rejects (request denied)
```

## Workflow Example: Collect Overdue

```
1. User (Waff Clerk) logs in
   ↓
2. Navigates to Jobs page
   ↓
3. Finds a job and expands it
   ↓
4. Expands petty cash assignment section
   ├─ Assignment has negative balance: LKR -500.00
   └─ Sees "Collect Overdue" button
   ↓
5. Clicks "Collect Overdue" button
   ↓
6. Modal appears showing:
   • Overdue amount in red: LKR 500.00
   • Original assignment amount: LKR 10,000.00
   ↓
7. Optionally adds notes explaining the overspend
   ↓
8. Clicks "Request Overdue Collection" button
   ↓
9. Request sent to backend: /api/cash-balance-settlements
   {
     "assignmentId": 123,
     "settlementType": "OVERDUE_COLLECTION",
     "amount": 500.00,
     "notes": "Fuel overspend due to price increase"
   }
   ↓
10. Success message displays for 3 seconds
    ✓ Overdue collection submitted successfully
   ↓
11. Assignment status updates (typically to "Overdue Collected")
    ↓
12. Modal closes
   ↓
13. Manager reviews request in Management Settlement page
    ├─ Approves (updates assignment status permanently)
    └─ Rejects (request denied)
```

## Status Flow Chart

```
RETURN BALANCE FLOW:
┌──────────────┐
│   Assigned   │
└──────┬───────┘
       │ (Settlement items added)
       ↓
┌──────────────────────┐
│      Settled         │
│  (Balance > 0)       │
└──────┬───────────────┘
       │ (Return Balance button appears)
       │ (Waff Clerk clicks Return Balance)
       │ (Submits via modal)
       ↓
┌──────────────────────────────┐
│  Pending Approval / Balance  │
│  (Awaiting Manager approval) │
└──────┬───────────────────────┘
       │
       ├─→ Approved ──→ ┌──────────────────────┐
       │                │ Settled / Balance... │
       │                │ (Balance Returned)   │
       │                └──────────────────────┘
       │
       └─→ Rejected ──→ Back to Settled

COLLECT OVERDUE FLOW:
┌──────────────┐
│   Assigned   │
└──────┬───────┘
       │ (Settlement items added)
       │ (Spent more than assigned)
       ↓
┌──────────────────────┐
│    Over Due          │
│  (Balance < 0)       │
└──────┬───────────────┘
       │ (Collect Overdue button appears)
       │ (Waff Clerk clicks Collect Overdue)
       │ (Submits via modal)
       ↓
┌──────────────────────────────┐
│ Pending Approval / Over Due  │
│ (Awaiting Manager approval)  │
└──────┬───────────────────────┘
       │
       ├─→ Approved ──→ ┌──────────────────────┐
       │                │ Settled / Overdue... │
       │                │ (Overdue Collected)  │
       │                └──────────────────────┘
       │
       └─→ Rejected ──→ Back to Over Due
```

## Error Handling

### Validation
- **Empty balance:** "No balance or overdue amount to process." (error message)
- **API failure:** Shows API error message for 4 seconds

### Success Messages
- **Balance return:** "✓ Balance return submitted successfully" (3 seconds)
- **Overdue collection:** "✓ Overdue collection submitted successfully" (3 seconds)

### Form Preservation
- If modal submission fails, form data is preserved
- User can edit and retry without losing their notes

## Integration with Existing Features

✓ Works with existing "Settle" button (both visible in different conditions)
✓ Uses same authentication/authorization system
✓ Follows existing style and UX patterns
✓ Uses existing formatCurrency utilities
✓ Integrates with existing API client
✓ Respects existing role-based access control
✓ Follows existing message/notification patterns

## Notes for Testers

- **Button visibility depends on balance calculation:** Verify balance is correctly computed from assignments
- **Role-based filtering:** Only Waff Clerks can see these buttons
- **User assignment check:** Clerk can only use button if they're assigned to the petty cash
- **Status eligibility:** Not all statuses allow these buttons to appear
- **Modal cleanup:** Closing modal should reset all state
- **API payload structure:** Verify payload matches backend expectations
