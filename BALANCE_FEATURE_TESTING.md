# Petty Cash Balance Feature - Testing Guide

## Feature Implementation Summary

**Files Modified:**
- `frontend/src/components/JobPettyCash.js`

**Features Added:**
1. "Return Balance" button - for Waff Clerks with positive balance
2. "Collect Overdue" button - for Waff Clerks with negative balance
3. Balance/Overdue request modal with optional notes
4. API integration with `/api/cash-balance-settlements` endpoint

**Build Status:** ✅ Successful (no errors, project builds correctly)

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Ensure backend is running
- [ ] Log in as a Waff Clerk user
- [ ] Navigate to Jobs page
- [ ] Find a job with petty cash assignments

### Test 1: Return Balance Button Visibility

**Scenario:** Petty cash assignment with positive balance

**Setup:**
- Find a job with a settled petty cash assignment
- Assignment balance should be > 0 (e.g., LKR 1,000.00)
- Assignment status should be one of: Settled, Balance To Be Return, Settled/Approved

**Test Steps:**
1. Click expand arrow on the job row
2. Scroll to "Petty Cash" section
3. Click expand arrow on the petty cash assignment
4. Look for "Return Balance" button

**Expected Result:**
- [ ] "Return Balance" button is visible
- [ ] Button is green (bg-green-600)
- [ ] Button is at same level as "Settle" button
- [ ] Button appears ONLY when conditions above are met

**Not Visible When:**
- [ ] Balance = 0.00 (no positive balance)
- [ ] Balance < 0 (negative/overdue)
- [ ] Status not in eligible list
- [ ] User is Admin/Manager (not Waff Clerk)
- [ ] User is not assigned to this petty cash

---

### Test 2: Collect Overdue Button Visibility

**Scenario:** Petty cash assignment with negative balance (overspend)

**Setup:**
- Find a job with a petty cash assignment showing negative balance
- Assignment balance should be < 0 (e.g., LKR -500.00)
- Assignment status should be one of: Over Due, Settled, Settled/Approved

**Test Steps:**
1. Click expand arrow on the job row
2. Scroll to "Petty Cash" section
3. Click expand arrow on the petty cash assignment with negative balance
4. Look for "Collect Overdue" button

**Expected Result:**
- [ ] "Collect Overdue" button is visible
- [ ] Button is amber (bg-amber-600)
- [ ] Button is at same level as action buttons
- [ ] Button appears ONLY when conditions above are met

**Not Visible When:**
- [ ] Balance = 0.00 (no overspend)
- [ ] Balance > 0 (positive balance)
- [ ] Status not in eligible list
- [ ] User is Admin/Manager (not Waff Clerk)
- [ ] User is not assigned to this petty cash

---

### Test 3: Return Balance Modal

**Scenario:** Opening Return Balance modal

**Setup:**
- Have an eligible assignment visible with positive balance
- "Return Balance" button should be visible

**Test Steps:**
1. Click "Return Balance" button
2. Modal should appear

**Modal Content Verification:**
- [ ] Header shows "💰 Return Balance"
- [ ] Header shows assigned user's name
- [ ] Close button (×) is visible in top-right
- [ ] Amount section shows "Balance to Return:" in green text
- [ ] Amount displays the positive balance value
- [ ] Shows "Assigned:" with original assigned amount
- [ ] Notes textarea is present with placeholder text
- [ ] Notes field has max length of 500 characters
- [ ] "Cancel" button is gray
- [ ] "Request Balance Return" button is green

**Test Steps (Modal Interaction):**
1. Leave notes empty and click "Request Balance Return"
2. [ ] Success message appears: "✓ Balance return submitted successfully"
3. [ ] Message auto-dismisses after ~3 seconds
4. [ ] Modal closes
5. [ ] Assignment list refreshes
6. [ ] Assignment status may change to "Balance Returned"

**Test Steps (With Notes):**
1. Click "Return Balance" button again (if available)
2. Enter notes: "Balance returned after final reconciliation"
3. Click "Request Balance Return"
4. [ ] Request submitted successfully
5. [ ] Notes are included in the API request

**Test Steps (Cancel):**
1. Click "Return Balance" button
2. Type some notes
3. Click "Cancel" button
4. [ ] Modal closes
5. [ ] Notes are discarded (next time button clicked, textarea is empty)

---

### Test 4: Collect Overdue Modal

**Scenario:** Opening Collect Overdue modal

**Setup:**
- Have an eligible assignment visible with negative balance
- "Collect Overdue" button should be visible

**Test Steps:**
1. Click "Collect Overdue" button
2. Modal should appear

**Modal Content Verification:**
- [ ] Header shows "📋 Collect Overdue"
- [ ] Header shows assigned user's name
- [ ] Close button (×) is visible in top-right
- [ ] Amount section shows "Overdue Amount to Collect:" in red text
- [ ] Amount displays the absolute value of negative balance
- [ ] Shows "Assigned:" with original assigned amount
- [ ] Notes textarea is present with placeholder text
- [ ] Notes field has max length of 500 characters
- [ ] "Cancel" button is gray
- [ ] "Request Overdue Collection" button is amber

**Test Steps (Modal Interaction):**
1. Leave notes empty and click "Request Overdue Collection"
2. [ ] Success message appears: "✓ Overdue collection submitted successfully"
3. [ ] Message auto-dismisses after ~3 seconds
4. [ ] Modal closes
5. [ ] Assignment list refreshes
6. [ ] Assignment status may change to "Overdue Collected"

**Test Steps (With Notes):**
1. Click "Collect Overdue" button again (if available)
2. Enter notes: "Overspent due to emergency fuel charges"
3. Click "Request Overdue Collection"
4. [ ] Request submitted successfully
5. [ ] Notes are included in the API request

---

### Test 5: Role-Based Access Control

**Scenario A: Admin User**

**Setup:**
- Log in as Admin or Super Admin user
- Navigate to a job with petty cash assignments

**Expected Result:**
- [ ] "Return Balance" button NOT visible (even if balance > 0)
- [ ] "Collect Overdue" button NOT visible (even if balance < 0)
- [ ] "Settle" button also not visible (if status = Assigned)
- [ ] Petty cash data displays in read-only mode

**Scenario B: Manager User**

**Setup:**
- Log in as Manager user
- Navigate to a job with petty cash assignments

**Expected Result:**
- [ ] "Return Balance" button NOT visible
- [ ] "Collect Overdue" button NOT visible

**Scenario C: Different Waff Clerk**

**Setup:**
- Have a petty cash assignment assigned to User A
- Log in as User B (different Waff Clerk)
- Navigate to the same job

**Expected Result:**
- [ ] "Return Balance" button NOT visible (assigned to different user)
- [ ] "Collect Overdue" button NOT visible (assigned to different user)

---

### Test 6: API Request Payload

**Scenario:** Verify correct data sent to API

**Setup:**
- Open browser developer tools (F12)
- Go to Network tab
- Have a "Return Balance" or "Collect Overdue" modal open

**Test Steps:**
1. Enter notes: "Test payment request"
2. Click submit button
3. In Network tab, find POST request to `/api/cash-balance-settlements` or `/cash-balance-settlements`
4. Click on the request
5. Check Request payload

**Expected Payload for Return Balance:**
```javascript
{
  "assignmentId": 123,
  "settlementType": "BALANCE_RETURN",
  "amount": 1000.00,
  "notes": "Test payment request"
}
```

**Expected Payload for Collect Overdue:**
```javascript
{
  "assignmentId": 123,
  "settlementType": "OVERDUE_COLLECTION",
  "amount": 500.00,
  "notes": "Test payment request"
}
```

**Verification:**
- [ ] settlementType is correct ("BALANCE_RETURN" or "OVERDUE_COLLECTION")
- [ ] amount is positive number (absolute value)
- [ ] assignmentId is correct
- [ ] notes are included if provided

---

### Test 7: Error Handling

**Scenario A: Network Error During Submission**

**Setup:**
- Open DevTools Network tab
- Throttle network to simulate connection issues

**Test Steps:**
1. Open Return Balance or Collect Overdue modal
2. Click submit button
3. Network error should occur

**Expected Result:**
- [ ] Error message displays for ~4 seconds
- [ ] Modal remains open
- [ ] User can retry submission
- [ ] Form data is preserved

**Scenario B: Server Error Response**

**Setup:**
- Use DevTools to intercept and modify response
- Or trigger a server error (if possible)

**Expected Result:**
- [ ] Error message from server displays
- [ ] Modal remains open for retry
- [ ] Form data preserved

---

### Test 8: Message Display and Auto-Dismiss

**Scenario:** Messages appear and auto-dismiss

**Test Steps:**
1. Submit a successful Return Balance request
2. Note the time when success message appears
3. Wait and observe when it disappears

**Expected Result:**
- [ ] Success message appears in green box
- [ ] Message reads: "✓ Balance return submitted successfully" (or overdue equivalent)
- [ ] Message auto-dismisses after ~3 seconds
- [ ] Modal closes after message dismissal

**Error Message Test:**
1. Trigger an error (network issue, etc.)
2. Note the time error appears
3. Wait and observe when it disappears

**Expected Result:**
- [ ] Error message appears in red box
- [ ] Message auto-dismisses after ~4 seconds
- [ ] Modal remains open (user can retry)

---

### Test 9: Assignment Refresh After Submission

**Scenario:** Assignment data updates after successful submission

**Setup:**
- Have a petty cash assignment visible
- Take note of current status and balance

**Test Steps:**
1. Click "Return Balance" or "Collect Overdue" button
2. Submit the request
3. Watch the assignment row

**Expected Result:**
- [ ] Assignment row refreshes
- [ ] Status may change (typically to "Balance Returned" or "Overdue Collected")
- [ ] Balance value updates if applicable
- [ ] Buttons may hide/show based on new status

---

### Test 10: Multiple Assignments in One Job

**Scenario:** Verify buttons work correctly with multiple petty cash assignments

**Setup:**
- Find a job with 2+ petty cash assignments
- Assignments have different balances (some positive, some negative)

**Test Steps:**
1. Expand first assignment (positive balance)
2. [ ] "Return Balance" button visible
3. Collapse it
4. Expand second assignment (negative balance)
5. [ ] "Collect Overdue" button visible
6. Click "Return Balance" on first assignment
7. Submit request
8. Check second assignment still shows "Collect Overdue" button

**Expected Result:**
- [ ] Each assignment shows appropriate buttons
- [ ] Actions on one assignment don't affect visibility on others
- [ ] All buttons function independently

---

## API Endpoint Testing

### Endpoint
```
POST /api/cash-balance-settlements
```

### Request Format
```javascript
{
  "assignmentId": number,
  "settlementType": "BALANCE_RETURN" | "OVERDUE_COLLECTION",
  "amount": number,
  "notes": string (optional)
}
```

### Expected Response (Success)
```javascript
HTTP 201 Created
{
  "success": true,
  "message": "Settlement request created",
  "data": {
    "settlementId": 456,
    "status": "PENDING",
    "...": "other settlement details"
  }
}
```

### Expected Response (Error)
```javascript
HTTP 400 Bad Request / 500 Server Error
{
  "message": "Error description"
}
```

### cURL Test Example
```bash
curl -X POST http://localhost:5000/api/cash-balance-settlements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "assignmentId": 123,
    "settlementType": "BALANCE_RETURN",
    "amount": 1000,
    "notes": "Balance return request"
  }'
```

---

## Browser Console Debugging

### Check Component State
```javascript
// In browser console on Jobs page
// Look for component logging
console.log('Balance action:', balanceAction);
console.log('Show modal:', showBalanceModal);
console.log('Selected assignment:', selectedAssignment);
```

### Monitor API Calls
```javascript
// Use Network tab in DevTools
// Filter: XHR/Fetch
// Look for: /cash-balance-settlements POST requests
```

### Common Issues and Solutions

**Issue:** Button not visible when it should be
- Check: Is user a Waff Clerk?
- Check: Is balance in correct range (> 0 or < 0)?
- Check: Is status in eligible list?
- Check: Is user assigned to this petty cash?

**Issue:** Modal not opening
- Check: Network console for errors
- Check: Is there JavaScript error in browser console?
- Check: Click event is registered?

**Issue:** API request fails
- Check: Is token valid?
- Check: Is backend running?
- Check: Is endpoint path correct?
- Check: Is request payload correct format?

**Issue:** Modal won't close
- Check: Did submission succeed? (look for success message)
- Check: Browser console for errors
- Check: Try clicking × button or Cancel manually

---

## Performance Testing

### Load Time
- [ ] Page loads quickly with petty cash assignments
- [ ] Expanding assignment doesn't cause lag
- [ ] Modal opens without delay
- [ ] Submission request completes within reasonable time (< 5 seconds)

### Memory
- [ ] No memory leaks when repeatedly opening/closing modals
- [ ] Component properly cleans up state on unmount

### Browser Compatibility
- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Edge (latest)
- [ ] Responsive on mobile devices

---

## Regression Testing

Verify these existing features still work after the new buttons were added:

- [ ] "Settle" button still works for Assigned status assignments
- [ ] Inline edit/delete of settlement items still works
- [ ] Admin users can still assign petty cash via "Assign Petty Cash" button
- [ ] Summary totals (Total Assigned, Total Settled, Balance) still calculate correctly
- [ ] Other petty cash statuses display correctly
- [ ] Role-based access control still enforced for existing features
- [ ] Page refresh refreshes all data correctly
- [ ] Job expansion/collapse works smoothly

---

## Success Criteria

All of the following must pass for feature to be considered complete:

✅ Both buttons render when conditions are met
✅ Buttons hidden when conditions not met  
✅ Modals display correct information
✅ API requests sent with correct payload
✅ Success messages display and auto-dismiss
✅ Error messages display and auto-dismiss
✅ Role-based access control enforced
✅ Form data preserved on error
✅ Assignment refresh after successful submission
✅ No JavaScript errors in console
✅ No console warnings from this feature
✅ Buttons don't interfere with existing features
✅ Project builds without errors
✅ Mobile responsive display

---

## Sign-Off

**Date Tested:** _________________
**Tester Name:** _________________
**Test Environment:** 
- [ ] Local Development
- [ ] Staging Server
- [ ] Production

**All tests passed:** _________________
**Known issues:** _________________
**Notes:** _________________________________________________

