import { Shield } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Settings", href: "/settings" },
  { name: "Help", href: "/help" },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DWAS</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <ThemeToggle />
      </div>
    </header>
  )
}