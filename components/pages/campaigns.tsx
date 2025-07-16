import { Plus, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const campaigns = [
  {
    id: 1,
    title: "Help Build Clean Water Wells",
    description: "Providing clean water access to rural communities",
    goal: 50000,
    raised: 32500,
    status: "active",
    daysLeft: 15,
    backers: 234,
  },
  {
    id: 2,
    title: "Education for All Children",
    description: "Supporting education initiatives in underserved areas",
    goal: 25000,
    raised: 18750,
    status: "active",
    daysLeft: 8,
    backers: 156,
  },
  {
    id: 3,
    title: "Emergency Medical Fund",
    description: "Emergency medical assistance for families in need",
    goal: 15000,
    raised: 15000,
    status: "completed",
    daysLeft: 0,
    backers: 89,
  },
]

export function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Campaigns</h2>
          <p className="text-muted-foreground">Manage and track your fundraising campaigns</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : "Completed"}
                </div>
              </div>
              <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
              <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((campaign.raised / campaign.goal) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <DollarSign className="mr-1 h-4 w-4" />GHS {campaign.raised.toLocaleString()} raised
                  </div>
                  <div className="text-sm text-muted-foreground">{campaign.backers} backers</div>
                </div>
                <div className="text-sm text-muted-foreground">Goal: GHS {campaign.goal.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
