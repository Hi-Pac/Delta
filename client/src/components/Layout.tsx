import React, { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  RotateCcw,
  Wallet,
  CreditCard,
  UserCog,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: Receipt },
    { name: "Returns", href: "/returns", icon: RotateCcw },
    { name: "Finances", href: "/finances", icon: Wallet },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Users & Permissions", href: "/users", icon: UserCog },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
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
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group ${
                      isActive
                        ? "border-l-4 border-primary bg-primary-50 text-primary"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center p-4 border-t border-gray-200">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={currentUser?.photoURL || undefined}
                alt={currentUser?.displayName || "User"}
              />
              <AvatarFallback>
                {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.displayName || currentUser?.email || "User"}
              </p>
              <p className="text-xs font-medium text-gray-500">Administrator</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-20 m-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="h-16 border-b border-gray-200 flex items-center justify-center">
              <SheetTitle className="text-primary text-xl">Al-Haramain Paints</SheetTitle>
            </SheetHeader>
            
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group ${
                      isActive
                        ? "border-l-4 border-primary bg-primary-50 text-primary"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* User Profile */}
            <div className="flex items-center p-4 border-t border-gray-200 mt-auto">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={currentUser?.photoURL || undefined}
                  alt={currentUser?.displayName || "User"}
                />
                <AvatarFallback>
                  {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.displayName || currentUser?.email || "User"}
                </p>
                <p className="text-xs font-medium text-gray-500">Administrator</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
