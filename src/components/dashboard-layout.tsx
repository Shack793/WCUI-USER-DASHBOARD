import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  LayoutDashboard,
  Settings,
  Target,
  Wallet,
  Search,
  LogOut,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Campaigns",
    url: "/campaigns",
    icon: Target,
  },
 // {
 //   title: "My Contributions",
   // url: "/contributions",
    //icon: Heart,
 // },
  {
    title: "Withdrawals",
    url: "/withdrawals",
    icon: Wallet,
  },
  //{
   // title: "Comments",
   // url: "/comments",
   // icon: MessageSquare,
  //},
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Account Settings",
    url: "/settings",
    icon: Settings,
  },
  //{
   // title: "Support",
    //url: "/support",
   // icon: FileText,
 // },
]

function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#37b7ff]">
            <img
              src="/images/wgg.png"
              alt="MyEasyDonate Logo"
              className="h-5 w-5 object-contain"
            />
          </div>
          <span className="text-lg font-semibold">MyEasyDonate </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">MyEasyDonate, 2025</div>
      </SidebarFooter>
      <SidebarRail className="w-8 hover:w-12 transition-all duration-200 cursor-pointer" />
    </Sidebar>
  )
}

function DashboardHeader() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      console.log('Logging out user...')
      await logout()
      console.log('Logout successful, redirecting to login page')
      // The auth context will handle the navigation to "/"
      // but we need to override it to go to "/login"
      setTimeout(() => {
        navigate("/login", { replace: true })
      }, 100)
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear local state and redirect
      localStorage.removeItem('authToken')
      navigate("/login", { replace: true })
    }
  }

  // Generate user initials from name
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="mr-2" />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings">
            <Bell className="h-4 w-4" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled={loading}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt={user?.name || "User"} />
                <AvatarFallback>{user ? getUserInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6 overflow-auto w-full">{children}</main>
      </SidebarInset>
    </>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
