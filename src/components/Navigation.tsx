
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Users, 
  Building, 
  AlertTriangle, 
  User, 
  LogOut, 
  Home,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfileImage } from "@/hooks/useProfileImage";

interface UserProfile {
  full_name: string | null;
  email: string;
  role: string | null;
}

const Navigation = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { profileImage } = useProfileImage();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          // Fallback to user data
          setUserProfile({
            full_name: user.email?.split("@")[0] || "User",
            email: user.email || "",
            role: "user"
          });
        } else {
          setUserProfile({
            full_name: profile.full_name || user.email?.split("@")[0] || "User",
            email: profile.email || user.email || "",
            role: profile.role || "user"
          });
        }
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear all auth-related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('profile-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      
      // Force page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out properly",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: Home,
      description: "Main dashboard"
    },
    { 
      name: "Timetables", 
      path: "/timetable", 
      icon: Calendar,
      description: "View and manage timetables"
    },
    { 
      name: "Staff", 
      path: "/staff", 
      icon: Users,
      description: "Staff management"
    },
    { 
      name: "Subjects", 
      path: "/subjects", 
      icon: Users,
      description: "Subject management"
    },
    { 
      name: "Classrooms", 
      path: "/classrooms", 
      icon: Building,
      description: "Classroom management"
    },
    { 
      name: "Conflicts", 
      path: "/conflicts", 
      icon: AlertTriangle,
      description: "Resolve conflicts"
    },
    { 
      name: "Issues", 
      path: "/issues", 
      icon: BookOpen,
      description: "Report and track issues"
    },
  ];

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground";
  };

  if (isLoading) {
    return (
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded"></div>
              <div className="w-20 h-6 bg-muted rounded"></div>
            </div>
            <div className="animate-pulse w-8 h-8 bg-muted rounded-full"></div>
          </div>
        </div>
      </nav>
    );
  }

  const NavigationContent = () => (
    <>
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
              isActive
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg font-montserrat text-foreground">SKCT</h1>
              <p className="text-xs text-muted-foreground -mt-1">Timetable System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavigationContent />
          </div>

          {/* Right side - Theme Toggle, Profile, and Mobile Menu */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Desktop User Profile */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {userProfile?.full_name || "User"}
                </p>
                <div className="flex items-center justify-end space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRoleColor(userProfile?.role || "user")}`}
                  >
                    {userProfile?.role?.charAt(0).toUpperCase()}{userProfile?.role?.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <Link to="/profile" className="hover:scale-105 transition-transform">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={profileImage} alt={userProfile?.full_name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                    {(userProfile?.full_name || userProfile?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline ml-2">Sign Out</span>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col h-full">
                  {/* Mobile User Profile */}
                  <div className="flex items-center space-x-3 p-4 border-b border-border">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={profileImage} alt={userProfile?.full_name || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {(userProfile?.full_name || userProfile?.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {userProfile?.full_name || "User"}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRoleColor(userProfile?.role || "user")}`}
                      >
                        {userProfile?.role?.charAt(0).toUpperCase()}{userProfile?.role?.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 py-4 space-y-2">
                    <NavigationContent />
                  </div>

                  {/* Mobile Profile and Sign Out */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
