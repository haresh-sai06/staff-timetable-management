
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Calendar, Users, MapPin, AlertTriangle, Home, GraduationCap, User, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const name = localStorage.getItem("userName");
    setIsAuthenticated(!!token);
    setUserName(name || "User");
  }, [location]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Timetable", path: "/timetable" },
    { icon: Users, label: "Staff", path: "/staff" },
    { icon: MapPin, label: "Classrooms", path: "/classrooms" },
    { icon: AlertTriangle, label: "Conflicts", path: "/conflicts" },
    { icon: MessageSquare, label: "Issues", path: "/issues" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsOpen(false);
  };

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

            {/* Profile/Login Section */}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 hover:bg-accent/10 text-accent hover:text-accent/80"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{userName}</span>
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
              ) : (
                <Button
                  onClick={handleLoginClick}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleProfileClick}
                    className="w-full justify-start space-x-2 text-accent hover:text-accent/80"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile ({userName})</span>
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
              ) : (
                <Button
                  onClick={handleLoginClick}
                  className="w-full justify-start space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <User className="h-4 w-4" />
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
