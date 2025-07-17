
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Users } from "lucide-react";

interface StaffActionsProps {
  staffId: string;
  isAdmin: boolean;
  onEdit: (staffId: string) => void;
  onDelete: (staffId: string) => void;
  onView: (staffId: string) => void;
  onAssignTutor: (staffId: string) => void;
}

const StaffActions = ({ staffId, isAdmin, onEdit, onDelete, onView, onAssignTutor }: StaffActionsProps) => {
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
        title="Edit Staff"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="hover:bg-blue-50 text-blue-600"
        onClick={() => onAssignTutor(staffId)}
        title="Assign as Tutor"
      >
        <Users className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => onDelete(staffId)}
        title="Delete Staff"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default StaffActions;
