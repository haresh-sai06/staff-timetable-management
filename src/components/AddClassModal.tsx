
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  day?: string;
  timeSlot?: string;
}

const AddClassModal = ({ isOpen, onClose, department, day, timeSlot }: AddClassModalProps) => {
  const [formData, setFormData] = useState({
    subject: "",
    subjectCode: "",
    staff: "",
    classroom: "",
    studentGroup: "",
    year: "",
    day: day || "",
    timeSlot: timeSlot || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Adding class:", { ...formData, department });
      
      toast({
        title: "Class Added",
        description: `Successfully added ${formData.subject} to the timetable`,
      });
      
      // Reset form and close modal
      setFormData({
        subject: "",
        subjectCode: "",
        staff: "",
        classroom: "",
        studentGroup: "",
        year: "",
        day: "",
        timeSlot: "",
      });
      onClose();
      
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Error",
        description: "Failed to add class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            <CardTitle className="text-foreground">Add New Class</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-foreground">Subject Name</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subjectCode" className="text-foreground">Subject Code</Label>
                  <Input
                    id="subjectCode"
                    value={formData.subjectCode}
                    onChange={(e) => handleInputChange("subjectCode", e.target.value)}
                    placeholder="e.g., CS8391"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="staff" className="text-foreground">Staff Name</Label>
                  <Input
                    id="staff"
                    value={formData.staff}
                    onChange={(e) => handleInputChange("staff", e.target.value)}
                    placeholder="e.g., Dr. John Doe"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="classroom" className="text-foreground">Classroom</Label>
                  <Input
                    id="classroom"
                    value={formData.classroom}
                    onChange={(e) => handleInputChange("classroom", e.target.value)}
                    placeholder="e.g., CSE-101"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="studentGroup" className="text-foreground">Student Group</Label>
                  <Input
                    id="studentGroup"
                    value={formData.studentGroup}
                    onChange={(e) => handleInputChange("studentGroup", e.target.value)}
                    placeholder="e.g., CSE-3A"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="year" className="text-foreground">Year</Label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="day" className="text-foreground">Day</Label>
                  <select
                    id="day"
                    value={formData.day}
                    onChange={(e) => handleInputChange("day", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="timeSlot" className="text-foreground">Time Slot</Label>
                  <select
                    id="timeSlot"
                    value={formData.timeSlot}
                    onChange={(e) => handleInputChange("timeSlot", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="08:00-09:00">08:00-09:00</option>
                    <option value="09:00-10:00">09:00-10:00</option>
                    <option value="10:15-11:15">10:15-11:15</option>
                    <option value="11:15-12:15">11:15-12:15</option>
                    <option value="13:15-14:15">13:15-14:15</option>
                    <option value="14:15-15:15">14:15-15:15</option>
                    <option value="15:30-16:30">15:30-16:30</option>
                    <option value="16:30-17:30">16:30-17:30</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-muted-foreground text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Class</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AddClassModal;
