import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Moon,
  Sun,
  LogIn,
  User,
  ShoppingCart
} from "lucide-react";
import { Link } from "wouter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://pub-5b34ab7e74be4b678343a2ff1c41d64c.r2.dev/iptvtop%20live%20logo.png"
              alt="IPTV TOP"
              className="h-9 w-auto"
            />
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Plans & Pricing
              </Button>
            </Link>
          </nav>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default" size="sm" className="gap-2 gradient-primary">
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="default" size="sm" className="gap-2 gradient-primary">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} IPTV Premium. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
