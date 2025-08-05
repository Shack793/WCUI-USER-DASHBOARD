import { MessageCircle, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support</h2>
        <p className="text-muted-foreground">Get help and support for your crowdfunding journey</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>Send us a message and we'll get back to you soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help you?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Describe your issue or question..." rows={4} />
            </div>
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>

        {/* Quick Help */}
       {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Quick Help
            </CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                How to create a campaign?
              </Button>
              <Button variant="outline" className="w-full justify-start">
                How to withdraw funds?
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Campaign approval process
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Payment and fees
              </Button>
            </div>
          </CardContent>
        </Card>*/}
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
          <CardDescription>Alternative contact methods for urgent matters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@wgcrowdfunding.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+233 (0) 123-4567</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">How long does campaign approval take?</h4>
            <p className="text-sm text-muted-foreground">
              Campaign approval typically takes 1-3 business days. We review each campaign to ensure it meets our
              guidelines and community standards.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">What are the platform fees?</h4>
            <p className="text-sm text-muted-foreground">
              We charge a 2% platform fee on successfully funded campaigns, plus payment processing fees of 2.9% + $0.30
              per transaction.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">How do I withdraw my funds?</h4>
            <p className="text-sm text-muted-foreground">
              You can request withdrawals from your dashboard. Funds are typically transferred to your Momo instantly or to your
              bank account within 2-5 business days.
              within 2-5 business days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
