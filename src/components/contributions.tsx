import { Heart, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const contributions = [
  {
    id: 1,
    campaignTitle: "Help Build Clean Water Wells",
    amount: 250,
    date: "2024-01-15",
    status: "completed",
    campaignOwner: "Sarah Johnson",
    message: "Great cause! Happy to contribute.",
  },
  {
    id: 2,
    campaignTitle: "Education for All Children",
    amount: 100,
    date: "2024-01-10",
    status: "completed",
    campaignOwner: "Mike Chen",
    message: "Education is the key to a better future.",
  },
  {
    id: 3,
    campaignTitle: "Emergency Medical Fund",
    amount: 500,
    date: "2024-01-08",
    status: "pending",
    campaignOwner: "Lisa Rodriguez",
    message: "Hope this helps during this difficult time.",
  },
]

export function ContributionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Contributions</h2>
        <p className="text-muted-foreground">Track your donations and contributions to campaigns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850</div>
            <p className="text-xs text-muted-foreground">Across 3 campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Supported</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$283</div>
            <p className="text-xs text-muted-foreground">Per campaign</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {contributions.map((contribution) => (
          <Card key={contribution.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contribution.campaignTitle}</CardTitle>
                <Badge variant={contribution.status === "completed" ? "default" : "secondary"}>
                  {contribution.status}
                </Badge>
              </div>
              <CardDescription>Campaign by {contribution.campaignOwner}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-lg font-semibold">
                    <DollarSign className="mr-1 h-5 w-5" />
                    {contribution.amount}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(contribution.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {contribution.message && (
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <p className="text-sm italic">"{contribution.message}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
