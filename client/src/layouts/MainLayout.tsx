import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Users, 
  Package2, 
  Receipt, 
  RotateCcw, 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu 
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { currentUser } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out",
      });
    }
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package2 },
    { name: "Sales", href: "/sales", icon: Receipt },
    { name: "Returns", href: "/returns", icon: RotateCcw },
    { name: "Finances", href: "/finances", icon: Wallet },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Users & Permissions", href: "/users", icon: ShieldCheck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-primary">Al-Haramain Paints</h1>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group
                    ${location === item.href || location.startsWith(item.href + "/") 
                      ? "bg-primary/10 text-primary border-l-4 border-primary" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${location === item.href || location.startsWith(item.href + "/") ? "text-primary" : "text-gray-500"}`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center p-4 border-t border-gray-200">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser?.photoURL || ""} alt="User avatar" />
              <AvatarFallback>{currentUser?.displayName?.substring(0, 2) || "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentUser?.displayName || "User"}</p>
              <p className="text-xs font-medium text-gray-500">{currentUser?.email || ""}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden fixed top-0 left-0 z-20 m-4">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-primary">Al-Haramain Paints</h1>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-grow overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group
                        ${location === item.href || location.startsWith(item.href + "/") 
                          ? "bg-primary/10 text-primary border-l-4 border-primary" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${location === item.href || location.startsWith(item.href + "/") ? "text-primary" : "text-gray-500"}`} />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              <Separator />
              
              {/* User Profile */}
              <div className="flex items-center p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.photoURL || ""} alt="User avatar" />
                  <AvatarFallback>{currentUser?.displayName?.substring(0, 2) || "U"}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.displayName || "User"}</p>
                  <p className="text-xs font-medium text-gray-500">{currentUser?.email || ""}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
