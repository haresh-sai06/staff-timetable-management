
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Calendar, Users, MapPin, AlertTriangle, Home, GraduationCap, User as UserIcon, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  department: string | null;
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id);
            }
          }, 100);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Create a basic profile from user data if profile doesn't exist
        if (user?.email) {
          setUserProfile({
            id: userId,
            email: user.email,
            full_name: user.email.split("@")[0],
            role: user.email.includes('admin') ? 'admin' : 'user',
            department: null
          });
        }
        setLoading(false);
        return;
      }

      if (profile) {
        console.log("Fetched profile:", profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Timetable", path: "/timetable" },
    { icon: Users, label: "Staff", path: "/staff" },
    { icon: MapPin, label: "Classrooms", path: "/classrooms" },
    { icon: AlertTriangle, label: "Conflicts", path: "/conflicts" },
    { icon: MessageSquare, label: "Issues", path: "/issues" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Clear localStorage
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Force navigation to login
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      window.location.href = "/login";
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsOpen(false);
  };

  const userName = userProfile?.full_name || user?.email?.split("@")[0] || "User";
  const userEmail = userProfile?.email || user?.email || "";
  const userRole = userProfile?.role || 'user';
  const isAdmin = userRole === 'admin';

  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-card/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* SKCT Logo and Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-primary p-3 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-montserrat font-bold text-xl text-accent">
                Sri Krishna College of Technology
              </h1>
              <p className="text-sm text-muted-foreground">
                Autonomous | Affiliated to Anna University | NIRF Rank 83 (2024)
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Navigation Items */}
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "hover:bg-accent/10 text-foreground hover:text-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </motion.div>
            ))}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile/Login Section */}
            <div className="ml-4 flex items-center space-x-2">
              {user && !loading ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 hover:bg-accent/10 text-accent hover:text-accent/80"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src="" 
                        alt={userName} 
                      />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userName}</span>
                      {userEmail && (
                        <span className="text-xs text-muted-foreground">{userEmail}</span>
                      )}
                    </div>
                    {isAdmin && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
              ) : (
                <Button
                  onClick={handleLoginClick}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-accent"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-2 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`w-full justify-start space-x-2 ${
                  isActive(item.path)
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "hover:bg-accent/10 text-foreground hover:text-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}

            {/* Mobile Profile/Login */}
            <div className="border-t border-border pt-2 mt-2">
              {user && !loading ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="w-full justify-start space-x-2 text-accent hover:text-accent/80"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src="" 
                        alt={userName} 
                      />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{userName}</span>
                      {isAdmin && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>
                      )}
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start space-x-2 text-destructive hover:text-destructive/80"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                </div>
              ) : (
                <Button
                  onClick={handleLoginClick}
                  className="w-full justify-start space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navigation;
