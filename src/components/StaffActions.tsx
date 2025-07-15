
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";

interface StaffActionsProps {
  staffId: string;
  isAdmin: boolean;
  onEdit: (staffId: string) => void;
  onDelete: (staffId: string) => void;
  onView: (staffId: string) => void;
}

const StaffActions = ({ staffId, isAdmin, onEdit, onDelete, onView }: StaffActionsProps) => {
  if (!isAdmin) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 border-border hover:bg-accent/10"
        onClick={() => onView(staffId)}
      >
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="hover:bg-accent/10"
        onClick={() => onEdit(staffId)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => onDelete(staffId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default StaffActions;
