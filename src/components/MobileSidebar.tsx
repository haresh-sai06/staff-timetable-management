
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Building, 
  AlertTriangle, 
  User, 
  Home, 
  Menu, 
  X,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
    { 
      name: "Profile", 
      path: "/profile", 
      icon: User,
      description: "User profile settings"
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 h-full w-80 bg-card/95 backdrop-blur-md border-r border-border z-50 md:hidden overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg font-montserrat">SKCT</h2>
                    <p className="text-xs text-muted-foreground">Timetable System</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* College Info */}
              <div className="mb-8 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1 font-montserrat">
                  Sri Krishna College of Technology
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Autonomous | Affiliated to Anna University
                </p>
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                  NIRF Rank 83 (2024)
                </Badge>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink
                        to={item.path}
                        onClick={toggleSidebar}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs opacity-75 truncate">{item.description}</p>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 bg-accent-foreground rounded-full"
                          />
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Made with ❤️ for SKCT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Version 2.0
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileSidebar;
