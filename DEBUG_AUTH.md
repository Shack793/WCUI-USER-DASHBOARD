# Debug Authentication Issues

## How to Debug Authentication Problems

### 1. Open Browser Console (F12)
- Go to Console tab
- Look for authentication-related logs

### 2. Check Authentication Flow
1. Login successfully
2. Open console and look for these logs:
   ```
   🔍 Token found, checking if expired...
   🔍 Token payload: {...}
   🔍 Token expiration check: {...}
   ```

### 3. Test Page Refresh
1. After login, navigate to dashboard
2. Press F5 to refresh
3. Watch console for:
   - ✅ `Token valid, fetching user data...`
   - ✅ `User data fetched successfully:`
   - ❌ `Token expired, removing token`
   - ❌ `Authentication failed, removing token`

### 4. Check Network Tab
- Look for API calls to `/api/v1/me` or `/api/v1/user/profile`
- Check if Bearer token is being sent
- Look for 401 errors

### 5. Check Local Storage
1. Open Application tab (or Storage tab)
2. Go to Local Storage
3. Look for `authToken` key
4. Copy the token value and check it at [jwt.io](https://jwt.io)

### Common Issues:
1. **Token has no `exp` field** - Token should still work
2. **Token malformed** - Check backend JWT generation
3. **API endpoint `/api/v1/me` doesn't exist** - Check backend routes
4. **Clock skew** - Server/client time difference

### Quick Test Commands:
```javascript
// In browser console:
localStorage.getItem('authToken')
// Should return a token

// Decode token (if JWT format):
JSON.parse(atob(localStorage.getItem('authToken').split('.')[1]))
// Should show token payload
```
