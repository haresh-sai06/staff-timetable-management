import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddClassroomModal = ({ isOpen, onClose, onSuccess }: AddClassroomModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    department: "",
    building: "",
    floor: "",
    facilities: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classroomTypes = ["lecture", "lab"];
  const departments = [
    "Computer Science",
    "Electronics and Communication",
    "Mechanical Engineering", 
    "Civil Engineering",
    "Information Technology",
    "General"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const requiredFields = ['name', 'type', 'capacity', 'department'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const facilitiesArray = formData.facilities 
        ? formData.facilities.split(',').map(f => f.trim()).filter(f => f)
        : [];

      const { error } = await supabase
        .from('classrooms')
        .insert([{
          name: formData.name,
          type: formData.type,
          capacity: parseInt(formData.capacity),
          department: formData.department,
          building: formData.building || null,
          floor: formData.floor ? parseInt(formData.floor) : null,
          facilities: facilitiesArray,
          is_active: true
        }]);

      if (error) throw error;
      
      toast.success("Classroom added successfully!");
      setFormData({
        name: "",
        type: "",
        capacity: "",
        department: "",
        building: "",
        floor: "",
        facilities: ""
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding classroom:', error);
      toast.error("Failed to add classroom: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Add New Classroom</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Classroom Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., CSE-101"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {classroomTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity *</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", e.target.value)}
                      placeholder="e.g., 60"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Building</Label>
                    <Input
                      value={formData.building}
                      onChange={(e) => handleInputChange("building", e.target.value)}
                      placeholder="e.g., Main Building"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => handleInputChange("floor", e.target.value)}
                      placeholder="e.g., 1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Facilities</Label>
                  <Input
                    value={formData.facilities}
                    onChange={(e) => handleInputChange("facilities", e.target.value)}
                    placeholder="e.g., Projector, Audio System, Whiteboard (comma separated)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter facilities separated by commas
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Adding Classroom...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Classroom
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddClassroomModal;