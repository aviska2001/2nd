# CloudLinux NodeJS Selector Deployment Guide

This application is compatible with CloudLinux NodeJS Selector, which requires `node_modules` to be stored in a separate virtual environment folder and linked via symlink.

## Prerequisites

- CloudLinux server with NodeJS Selector enabled
- Node.js version compatible with your application (see package.json engines field)

## Deployment Steps

### 1. Upload Application Files

Upload all application files to your domain's public folder EXCEPT the `node_modules` directory. The application should not contain a `node_modules` folder in the root.

### 2. Setup NodeJS Application in cPanel

1. Go to **NodeJS Selector** in cPanel
2. Click **Create Application**
3. Choose the appropriate Node.js version
4. Set the following parameters:
   - **Application root**: Path to your application (e.g., `public_html/my-app`)
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `server.js`
   - **Application mode**: `production`

### 3. Install Dependencies

The NodeJS Selector will automatically create a virtual environment and install dependencies from `package.json`. The `node_modules` will be created as a symlink pointing to the virtual environment.

### 4. Environment Variables

Set any required environment variables in the NodeJS Selector interface or create appropriate `.env` files as needed.

### 5. Start the Application

Click **Start** in the NodeJS Selector interface to launch your application.

## Important Notes

- **DO NOT** upload a `node_modules` folder from your local development environment
- The `node_modules` symlink will be automatically managed by CloudLinux NodeJS Selector
- Any changes to dependencies require restarting the application through the NodeJS Selector interface
- Use the NodeJS Selector interface to manage the application lifecycle (start, stop, restart)

## Application Structure for CloudLinux

```
your-app/
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── src/                   # Source code
├── public/                # Static assets
├── scripts/               # Build scripts
├── static-pages/          # Generated static pages
├── user-data/             # Application data
└── node_modules -> /path/to/virtual/env/node_modules  # Symlink (auto-created)
```

## Troubleshooting

- If the application fails to start, check the Node.js version compatibility
- Ensure all required environment variables are set
- Check the application logs through the NodeJS Selector interface
- Verify that `server.js` is properly configured as the startup file

## Local Development vs Production

### Local Development
- Use `npm install` to install dependencies normally
- `node_modules` exists as a regular directory
- Use `npm run dev` for development server

### CloudLinux Production
- Dependencies are installed automatically by NodeJS Selector
- `node_modules` is a symlink to virtual environment
- Application runs via `server.js` in production mode
