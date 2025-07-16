
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface EditClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
  onSave: (classroom: Classroom) => void;
}

const EditClassroomModal = ({ isOpen, onClose, classroom, onSave }: EditClassroomModalProps) => {
  const [formData, setFormData] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (classroom) {
      setFormData({ ...classroom });
    }
  }, [classroom]);

  const handleInputChange = (field: keyof Classroom, value: any) => {
    if (formData) {
      setFormData(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleEquipmentChange = (equipment: string) => {
    if (formData) {
      const equipmentArray = equipment.split(',').map(item => item.trim()).filter(item => item);
      setFormData(prev => ({
        ...prev!,
        equipment: equipmentArray
      }));
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      
      toast({
        title: "Classroom Updated",
        description: `${formData.name} has been successfully updated`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating classroom:", error);
      toast({
        title: "Error",
        description: "Failed to update classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="glassmorphism-strong border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span>Edit Classroom</span>
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-foreground font-medium">
                  Classroom Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., CSE-101"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-foreground font-medium">
                  Room Type
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar Room">Seminar Room</option>
                </select>
              </div>

              <div>
                <Label htmlFor="capacity" className="text-foreground font-medium">
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                  placeholder="60"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department" className="text-foreground font-medium">
                  Department
                </Label>
                <select
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="EEE">Electrical & Electronics</option>
                </select>
              </div>
            </div>

            {/* Equipment */}
            <div>
              <Label htmlFor="equipment" className="text-foreground font-medium">
                Equipment (comma-separated)
              </Label>
              <Input
                id="equipment"
                value={formData.equipment.join(', ')}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                placeholder="Projector, Audio System, Whiteboard"
                className="mt-1"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.equipment.map((equipment, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {equipment}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Utilization Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentBookings" className="text-foreground font-medium">
                  Current Bookings
                </Label>
                <Input
                  id="currentBookings"
                  type="number"
                  value={formData.currentBookings}
                  onChange={(e) => handleInputChange("currentBookings", parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="maxBookings" className="text-foreground font-medium">
                  Max Bookings
                </Label>
                <Input
                  id="maxBookings"
                  type="number"
                  value={formData.maxBookings}
                  onChange={(e) => handleInputChange("maxBookings", parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="isActive" className="text-foreground font-medium">
                Active
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
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

export default EditClassroomModal;
