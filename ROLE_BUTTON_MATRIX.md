# Petty Cash Button Visibility Matrix - By User Role

## Quick Reference Table

| Button | Admin | Super Admin | Manager | Waff Clerk | Other |
|--------|-------|------------|---------|-----------|-------|
| **+ Assign Petty Cash** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Settle** | ❌ | ❌ | ❌ | ✅* | ❌ |
| **Return Balance** | ❌ | ❌ | ❌ | ✅** | ❌ |
| **Collect Overdue** | ❌ | ❌ | ❌ | ✅*** | ❌ |
| **✎ Edit Item** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **✕ Delete Item** | ✅ | ✅ | ✅ | ✅ | ❌ |

### Legend
- **✅** = Button visible and functional
- **❌** = Button NOT visible
- **✅*** = Only if status = 'Assigned'
- **✅** = Only if balance > 0 AND status in [Settled, Balance To Be Return, Settled/Approved, Balance Returned]
- **✅** = Only if balance < 0 AND status in [Settled, Over Due, Settled/Approved, Overdue Collected]

---

## Detailed Conditions

### 1. Assign Petty Cash Button

```
VISIBLE FOR:
  • Admin role
  • Super Admin role
  • Manager role

NOT VISIBLE FOR:
  • Waff Clerk
  • Other roles
```

### 2. Settle Button

```
VISIBLE FOR:
  • Waff Clerk

CONDITIONS:
  • Assignment status = 'Assigned'
  • User ID matches assignment.assignedTo

NOT VISIBLE FOR:
  • Admin / Super Admin / Manager
  • Other roles
```

### 3. Return Balance Button (NEW)

```
VISIBLE FOR:
  • Waff Clerk

CONDITIONS:
  • Balance > 0 (positive balance)
  • Status in: [Settled, Balance To Be Return, Settled/Approved, Balance Returned]
  • User ID matches assignment.assignedTo

NOT VISIBLE FOR:
  • Admin / Super Admin / Manager
  • Other roles
  • When balance ≤ 0
  • When status not in eligible list
```

### 4. Collect Overdue Button (NEW)

```
VISIBLE FOR:
  • Waff Clerk

CONDITIONS:
  • Balance < 0 (negative balance / overdue)
  • Status in: [Settled, Over Due, Settled/Approved, Overdue Collected]
  • User ID matches assignment.assignedTo

NOT VISIBLE FOR:
  • Admin / Super Admin / Manager
  • Other roles
  • When balance ≥ 0
  • When status not in eligible list
```

### 5. Edit Item Button (✎)

```
VISIBLE FOR:
  • Admin role
  • Super Admin role
  • Manager role
  • Waff Clerk

CONDITIONS:
  • Status in: [Settled, Balance To Be Return, Over Due, Settled/Rejected, Balance Returned, Overdue Collected]
  • No invoice has been generated for the job
  • User ID matches assignment.assignedTo (for Waff Clerk only)

NOT VISIBLE FOR:
  • Other roles
  • When status not editable
  • When invoice generated
```

### 6. Delete Item Button (✕)

```
VISIBLE FOR:
  • Admin role
  • Super Admin role
  • Manager role
  • Waff Clerk

CONDITIONS:
  • All conditions for Edit Item must be met
  • Assignment has more than 1 settlement item
  • User ID matches assignment.assignedTo (for Waff Clerk only)

NOT VISIBLE FOR:
  • Other roles
  • When only 1 item in assignment
  • When status not editable
  • When invoice generated
```

---

## Practical Examples

### Scenario 1: Waff Clerk viewing their own assignment

**Assignment Details:**
- Status: Settled
- Balance: LKR 500.00 (positive)
- Assigned to: User (self)
- Invoice generated: No
- Settlement items: 2

**Visible Buttons:**
- ✅ **Return Balance** (balance > 0, status eligible, assigned to self)
- ✅ **✎ Edit Item** (status editable, no invoice, assigned to self)
- ✅ **✕ Delete Item** (status editable, no invoice, assigned to self, 2 items)

**Not Visible:**
- ❌ Settle (status not Assigned)
- ❌ Collect Overdue (balance not negative)
- ❌ Assign Petty Cash (Waff Clerk cannot assign)

---

### Scenario 2: Waff Clerk viewing other user's assignment

**Assignment Details:**
- Status: Settled
- Balance: LKR 500.00 (positive)
- Assigned to: Another User
- Invoice generated: No
- Settlement items: 2

**Visible Buttons:**
- ❌ No action buttons visible (role-based access)

**Explanation:**
- Cannot see edit/delete/return/collect buttons because not assigned to self
- Can only see the assignment data in read-only mode

---

### Scenario 3: Manager viewing assignment

**Assignment Details:**
- Status: Settled
- Balance: LKR 500.00 (positive)
- Assigned to: Waff Clerk User
- Invoice generated: No
- Settlement items: 2

**Visible Buttons:**
- ✅ **✎ Edit Item** (status editable, no invoice, manager role)
- ✅ **✕ Delete Item** (status editable, no invoice, manager role, 2 items)

**Not Visible:**
- ❌ Settle (manager cannot settle)
- ❌ Return Balance (manager cannot submit balance requests)
- ❌ Collect Overdue (manager cannot submit overdue requests)
- ❌ Assign Petty Cash (only in main header)

---

### Scenario 4: Waff Clerk with overdue amount

**Assignment Details:**
- Status: Over Due
- Balance: LKR -500.00 (negative / overdue)
- Assigned to: User (self)
- Invoice generated: No
- Settlement items: 2

**Visible Buttons:**
- ✅ **Collect Overdue** (balance < 0, status eligible, assigned to self)
- ✅ **✎ Edit Item** (status editable, no invoice, assigned to self)
- ✅ **✕ Delete Item** (status editable, no invoice, assigned to self, 2 items)

**Not Visible:**
- ❌ Settle (status not Assigned)
- ❌ Return Balance (balance not positive)

---

### Scenario 5: After invoice generated

**Assignment Details:**
- Status: Settled
- Balance: LKR 500.00 (positive)
- Assigned to: User (self)
- Invoice generated: **YES** ← Key difference
- Settlement items: 2

**Visible Buttons:**
- ❌ **✎ Edit Item** (invoice generated - NO EDIT)
- ❌ **✕ Delete Item** (invoice generated - NO DELETE)
- ✅ **Return Balance** (can still submit return request)
- ❌ **Collect Overdue** (balance not negative)

**Explanation:**
- Cannot edit/delete items once invoice is generated
- Can still submit balance return to management
- Once invoice exists, financial records are locked

---

## Special Cases

### Case 1: Balance = 0

```
Balance: LKR 0.00

Visible Buttons:
  ❌ Return Balance (balance NOT > 0)
  ❌ Collect Overdue (balance NOT < 0)
  ✅ Edit Item (if other conditions met)
  ✅ Delete Item (if other conditions met)
```

### Case 2: Only 1 Settlement Item

```
Settlement items: 1

Visible Buttons:
  ✅ Edit Item (if other conditions met)
  ❌ Delete Item (cannot delete last item)
```

### Case 3: Pending Status

```
Status: Assigned

Visible Buttons:
  ✅ Settle (if Waff Clerk, assigned to self)
  ❌ Return Balance (status not in eligible list)
  ❌ Collect Overdue (status not in eligible list)
  ❌ Edit Item (status not editable)
  ❌ Delete Item (status not editable)
```

### Case 4: Admin viewing Waff Clerk's assignment

```
User: Admin
Assignment: Assigned to Waff Clerk

Visible Buttons:
  ❌ Settle (admin cannot settle)
  ✅ Edit Item (admin role allows edit)
  ✅ Delete Item (admin role allows delete)
  ❌ Return Balance (admin cannot submit)
  ❌ Collect Overdue (admin cannot submit)
```

---

## Implementation Details

### Code Location
- **Role checks:** `frontend/src/utils/pettyCashUtils.js`
- **Button rendering:** `frontend/src/components/JobPettyCash.js`

### Key Functions
```javascript
isAdminRole(user)           // Returns true for Admin, Super Admin, Manager
isClerkRole(user)           // Returns true for Waff Clerk
canEditSettlement(...)      // Checks if user can edit items
canDeleteSettlementItem(..) // Checks if user can delete items
```

### Button Rendering Logic
Each button checks multiple conditions before rendering. The conditions are combined with AND logic (all must be true):

```javascript
{balanceAction === 'RETURN' && 
  assignment.balance > 0 && 
  eligibleStatuses.includes(assignment.status) &&
  isClerkRole(user) && 
  assignment.assignedTo === user?.userId && (
  <button>Return Balance</button>
)}
```

---

## Testing Checklist

- [ ] Admin can see Edit/Delete buttons
- [ ] Super Admin can see Edit/Delete buttons  
- [ ] Manager can see Edit/Delete buttons
- [ ] Waff Clerk can see Edit/Delete buttons on own assignment
- [ ] Waff Clerk cannot see Edit/Delete on other user's assignment
- [ ] Other roles cannot see any action buttons
- [ ] Return Balance only shows for Waff Clerk with balance > 0
- [ ] Collect Overdue only shows for Waff Clerk with balance < 0
- [ ] Buttons hide when status changes to ineligible
- [ ] Buttons hide when invoice is generated
- [ ] Assign Petty Cash only shows for Admin/Super Admin/Manager
- [ ] Settle button only shows for Waff Clerk with status = Assigned
