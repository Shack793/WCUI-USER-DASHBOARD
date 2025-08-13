# PixFund - Crowdfunding Dashboard

A modern React SPA dashboard for crowdfunding platform users built with Vite, React Router, and Tailwind CSS.

## 🚀 Features

- **Modern Dashboard UI** with responsive design
- **Sidebar Navigation** using shadcn/ui components
- **Campaign Management** - Create, track, and manage campaigns
- **Contribution Tracking** - Monitor donations and contributions
- **Withdrawal Management** - Handle fund withdrawals
- **Real-time Notifications** - Stay updated with campaign activities
- **User Settings** - Manage account preferences
- **Support System** - Get help and contact support

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Axios** for API communication
- **Recharts** for data visualization
- **Lucide React** for icons

## 📦 Installation & Setup

1. **Clone or download the project**

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Update the `.env` file with your API endpoint:
   \`\`\`
   VITE_API_BASE_URL=https://admin.myeasydonate.com/api
   \`\`\`

4. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🏗 Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## 📁 Project Structure

\`\`\`
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── pages/              # Page components
│   ├── dashboard-layout.tsx
│   └── dashboard-content.tsx
├── lib/
│   ├── api.ts              # Axios API configuration
│   └── utils.ts            # Utility functions
├── hooks/
│   └── use-mobile.tsx      # Custom hooks
├── App.tsx                 # Main app component
├── main.tsx               # App entry point
└── index.css              # Global styles
\`\`\`

## 🔌 API Integration

The project includes a pre-configured Axios setup in `src/lib/api.ts` with:

- **Base URL configuration** from environment variables
- **Request/Response interceptors** for authentication
- **Error handling** for common scenarios
- **Pre-defined API endpoints** for all dashboard features

### Example API Usage:

\`\`\`typescript
import { dashboardAPI } from '@/lib/api'

// Fetch dashboard stats
const stats = await dashboardAPI.getDashboardStats()

// Create a new campaign
const campaign = await dashboardAPI.createCampaign(campaignData)

// Get user contributions
const contributions = await dashboardAPI.getContributions()
\`\`\`

## 🎨 Customization

### Styling
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for theme customization
- Components use Tailwind CSS classes for easy styling

### API Endpoints
- Update `src/lib/api.ts` to match your backend API
- Modify the base URL in `.env` file
- Add authentication tokens as needed

### Navigation
- Edit `src/components/dashboard-layout.tsx` to modify sidebar items
- Update `src/App.tsx` to add/remove routes

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🔐 Authentication

The project includes authentication setup:
- Token storage in localStorage
- Automatic token attachment to requests
- Redirect to login on 401 errors

## 📊 Data Visualization

Charts are implemented using Recharts with:
- **Bar charts** for donation/withdrawal trends
- **Responsive design** that adapts to screen size
- **Custom styling** matching the dashboard theme

## 🚀 Deployment

### Vercel (Recommended)
\`\`\`bash
npm run build
# Deploy the dist folder to Vercel
\`\`\`

### Netlify
\`\`\`bash
npm run build
# Deploy the dist folder to Netlify
\`\`\`

### Other Platforms
Build the project and deploy the `dist` folder to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
