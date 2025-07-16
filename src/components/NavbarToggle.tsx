
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarToggleProps {
  onToggle: (isOpen: boolean) => void;
  isOpen: boolean;
}

const NavbarToggle = ({ onToggle, isOpen }: NavbarToggleProps) => {
  const handleToggle = () => {
    onToggle(!isOpen);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="md:hidden fixed top-4 left-4 z-50 bg-accent/90 hover:bg-accent text-accent-foreground backdrop-blur-sm"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.div>
    </Button>
  );
};

export default NavbarToggle;
