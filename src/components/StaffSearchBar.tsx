
import { useState } from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StaffSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

const StaffSearchBar = ({ onSearch, onClear }: StaffSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mb-6"
    >
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name (e.g., Dr. John Smith)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-10 bg-card/80 border-border focus:border-accent"
          />
        </div>
        <Button 
          onClick={handleSearch}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={!searchQuery.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        {searchQuery && (
          <Button 
            onClick={handleClear}
            variant="outline"
            className="border-border hover:bg-accent/10"
          >
            Clear
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default StaffSearchBar;
