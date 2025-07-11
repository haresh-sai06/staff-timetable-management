
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Calendar, Users, MapPin, AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Timetable", path: "/timetable" },
    { icon: Users, label: "Staff", path: "/staff" },
    { icon: MapPin, label: "Classrooms", path: "/classrooms" },
    { icon: AlertTriangle, label: "Conflicts", path: "/conflicts" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800 hidden sm:block">
              AU Timetable
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
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
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "hover:bg-indigo-50 text-gray-700"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
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
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "hover:bg-indigo-50 text-gray-700"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navigation;
