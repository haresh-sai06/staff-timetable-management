
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: string;
  department?: string;
  equipment: string[];
  isActive: boolean;
  currentBookings: number;
  maxBookings: number;
}

interface DeleteClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
  onDelete: (classroomId: string) => void;
}

const DeleteClassroomModal = ({ isOpen, onClose, classroom, onDelete }: DeleteClassroomModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!classroom) return;

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onDelete(classroom.id);
      
      toast({
        title: "Classroom Deleted",
        description: `${classroom.name} has been successfully deleted`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error deleting classroom:", error);
      toast({
        title: "Error",
        description: "Failed to delete classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !classroom) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="glassmorphism-strong border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Delete Classroom</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-foreground mb-4">
                Are you sure you want to delete the classroom <strong>{classroom.name}</strong>?
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                This action cannot be undone. All associated bookings and schedules will be affected.
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  This classroom has {classroom.currentBookings} active bookings that will be removed.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DeleteClassroomModal;
