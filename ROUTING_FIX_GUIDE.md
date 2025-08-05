# WG Crowdfunding Dashboard - Deployment Routing Fix

## Problem
When deploying a React SPA (Single Page Application) with client-side routing, direct URL access or page refreshes on routes other than the home page (/) result in 404 errors.

## Solution
The following files have been added to fix the routing issue:

### 1. `.htaccess` (For Apache servers)
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### 2. `_redirects` (For Netlify/Vercel)
```
/*    /index.html   200
```

## How it works
- When a user visits `/campaigns` directly or refreshes the page on that route
- The server tries to find a `/campaigns` file/folder
- Since it doesn't exist, the rewrite rule redirects to `index.html`
- React Router takes over and displays the correct component

## Deployment Steps
1. Build the project: `npm run build`
2. Upload the entire `dist` folder to your web server
3. Ensure the server serves the `.htaccess` file (for Apache) or configure redirects (for other servers)

## Server-specific Configuration

### Apache (Most shared hosting)
- The `.htaccess` file should work automatically
- Ensure `mod_rewrite` is enabled

### Nginx
Add this to your server block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Vercel/Netlify
- Use the `_redirects` file (already included)
- Or add to `vercel.json`/`netlify.toml`

## Testing
After deployment, test these URLs directly:
- https://wgfund.wgtesthub.com/
- https://wgfund.wgtesthub.com/campaigns  
- https://wgfund.wgtesthub.com/dashboard
- https://wgfund.wgtesthub.com/login

All should work without 404 errors.
