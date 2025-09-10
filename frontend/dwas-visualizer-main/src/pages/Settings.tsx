import { useState } from "react"
import { User, Key, Bell, Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com"
  })
  
  const [notifications, setNotifications] = useState({
    scanComplete: true,
    vulnerabilityAlert: true,
    weeklyReport: false,
    emailDigest: true
  })
  
  const [apiKey, setApiKey] = useState("")
  const { toast } = useToast()

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    })
  }

  const handleGenerateApiKey = () => {
    const newKey = `dwas_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setApiKey(newKey)
    toast({
      title: "API key generated",
      description: "A new API key has been generated for your account.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage API keys and integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    placeholder="No API key generated"
                    readOnly
                  />
                  <Button variant="outline" onClick={handleGenerateApiKey}>
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this API key to integrate DWAS with your CI/CD pipeline
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the appearance of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Scan Complete Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when security scans finish
                    </p>
                  </div>
                  <Switch
                    checked={notifications.scanComplete}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, scanComplete: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Vulnerability Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Immediate alerts for critical security issues
                    </p>
                  </div>
                  <Switch
                    checked={notifications.vulnerabilityAlert}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, vulnerabilityAlert: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of your security posture each week
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily digest of scan activities and findings
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailDigest: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}