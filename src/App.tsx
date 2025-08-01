import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/auth-context"
import { ProtectedRoute } from "./components/protected-route"
import { LoginPage } from "./components/pages/login"
import { RegisterPage } from "./components/pages/register"
import { DashboardLayout } from "./components/dashboard-layout"
import { DashboardContent } from "./components/dashboard-content"
import { CampaignsPage } from "./components/pages/campaigns"
import { CreateCampaignPage } from "./components/pages/create-campaign"
import { UpdateCampaignPage } from "./components/pages/update-campaign"
import { BoostCampaignPage } from "./components/pages/boost-campaign"
import { ContributionsPage } from "./components/pages/contributions"
import { WithdrawalsPage } from "./components/pages/withdrawals"
import { NotificationsPage } from "./components/pages/notifications"
import { SettingsPage } from "./components/pages/settings"
import { SupportPage } from "./components/pages/support"
import { CommentsPage } from "./components/pages/comments"

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout><DashboardContent /></DashboardLayout>} />
          <Route path="/campaigns" element={<DashboardLayout><CampaignsPage /></DashboardLayout>} />
          <Route path="/campaigns/create" element={<DashboardLayout><CreateCampaignPage /></DashboardLayout>} />
          <Route path="/campaigns/:slug/update" element={<DashboardLayout><UpdateCampaignPage /></DashboardLayout>} />
          <Route path="/campaigns/:id/boost" element={<DashboardLayout><BoostCampaignPage /></DashboardLayout>} />
          <Route path="/contributions" element={<DashboardLayout><ContributionsPage /></DashboardLayout>} />
          <Route path="/withdrawals" element={<DashboardLayout><WithdrawalsPage /></DashboardLayout>} />
          <Route path="/comments" element={<DashboardLayout><CommentsPage /></DashboardLayout>} />
          <Route path="/notifications" element={<DashboardLayout><NotificationsPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/support" element={<DashboardLayout><SupportPage /></DashboardLayout>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
