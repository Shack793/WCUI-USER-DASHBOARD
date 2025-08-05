# 🔍 DASHBOARD ANALYTICS DEBUG GUIDE

## Problem Investigation
Dashboard showing data for different authenticated users instead of user-specific data.

## Root Cause Analysis

### Potential Issues:

1. **Backend Token Validation**
   - Backend might not be properly extracting user ID from token
   - Token might be expired or invalid
   - User authentication might be failing silently

2. **Frontend Token Transmission**
   - Token might not be sent correctly in Authorization header
   - Token format might be incompatible with backend expectations

3. **Backend User Context**
   - `$request->user()` might be returning wrong user
   - User session might be contaminated

## Debug Steps

### 1. Check Browser Console
After logging in and visiting dashboard, check console for:

```javascript
// Expected debug output:
🔍 Current authenticated user: { id: "123", name: "John Doe", email: "john@example.com" }
🔍 Authentication status: true
🔍 Fetching user dashboard data...
🚀 Request: { url: "/api/v1/userdashboard", headers: { Authorization: "Bearer 246|..." } }
🔍 Raw API response: { totalCampaigns: 2, totalContributions: "5000", ... }
```

### 2. Test User Identity
In browser console, run:
```javascript
// Check current user
const authContext = document.querySelector('[data-auth-context]')
console.log('Current user:', authContext?.user)

// Check token
const token = localStorage.getItem('authToken')
console.log('Token:', token)

// Test user endpoint
fetch('/api/v1/user', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

### 3. Backend Debug (Add to UserDashboardController)
```php
public function index(Request $request)
{
    \Log::info('Dashboard request received');
    
    $user = $request->user();
    \Log::info('Authenticated user:', ['id' => $user->id, 'email' => $user->email]);
    
    $userId = $user->id;
    \Log::info('Using user ID:', ['user_id' => $userId]);
    
    $totalCampaigns = Campaign::where('user_id', $userId)->count();
    \Log::info('User campaigns count:', ['count' => $totalCampaigns, 'user_id' => $userId]);
    
    // ... rest of the method
}
```

### 4. Check Database Queries
Look at database logs to verify queries use correct user_id:
```sql
-- Expected queries:
SELECT COUNT(*) FROM campaigns WHERE user_id = 123;
SELECT COUNT(*) FROM contributions INNER JOIN campaigns ON campaigns.id = contributions.campaign_id WHERE campaigns.user_id = 123;
```

## Common Issues & Solutions

### Issue 1: Wrong User ID
**Symptoms**: Dashboard shows data for user ID 1 regardless of who's logged in
**Cause**: Backend defaulting to admin user or wrong token parsing
**Solution**: Fix token validation in backend

### Issue 2: Cached Data
**Symptoms**: Dashboard shows old user's data after switching accounts
**Cause**: Frontend caching or backend session issues
**Solution**: Clear localStorage and refresh

### Issue 3: Token Format Mismatch
**Symptoms**: Backend can't identify user from token
**Cause**: Token format incompatibility
**Solution**: Verify token format matches backend expectations

## Test Different Users

1. **Login as User A**
   - Note dashboard stats
   - Check console logs for user ID

2. **Logout and Login as User B**
   - Dashboard should show different stats
   - Verify user ID changed in logs

3. **Compare Results**
   - If stats are same → Backend issue
   - If user ID is same → Token/auth issue

## Quick Verification

Run this in browser console after login:
```javascript
// Check if dashboard data matches current user
fetch('/api/v1/user', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
})
.then(r => r.json())
.then(userData => {
  console.log('Current user:', userData);
  
  return fetch('/api/v1/userdashboard', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
  });
})
.then(r => r.json())
.then(dashboardData => {
  console.log('Dashboard data:', dashboardData);
  console.log('✅ Data should be specific to current user');
});
```

## Expected Fix Areas

1. **Backend**: Ensure proper user identification from token
2. **Frontend**: Verify correct token transmission and user state
3. **Database**: Check user_id filtering in queries
4. **Auth**: Validate token parsing and user context
