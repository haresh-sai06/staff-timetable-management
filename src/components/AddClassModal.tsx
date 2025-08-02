import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  day?: string;
  timeSlot?: string;
}

const AddClassModal = ({ isOpen, onClose, department, day, timeSlot }: AddClassModalProps) => {
  const [formData, setFormData] = useState({
    subjectId: "",
    subjectCode: "",
    subjectName: "",
    subjectType: "",
    labDuration: 0,
    staff: "",
    classroom: "",
    studentGroup: "",
    year: "",
    day: day || "",
    timeSlot: timeSlot || "",
  });
  const [availableSubjects, setAvailableSubjects] = useState<Tables<"subjects">[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && department) {
      fetchSubjects();
    }
  }, [isOpen, department]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('department', department)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill subject details when subject is selected
    if (field === "subjectId") {
      const selectedSubject = availableSubjects.find(s => s.id === value);
      if (selectedSubject) {
        setFormData(prev => ({ 
          ...prev, 
          subjectCode: selectedSubject.code || "",
          subjectName: selectedSubject.name || "",
          subjectType: selectedSubject.type || "",
          labDuration: selectedSubject.lab_duration || 0,
          year: selectedSubject.year?.toString() || "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('timetable_entries')
        .insert([{
          subject_code: formData.subjectCode,
          staff_id: formData.staff,
          classroom_id: formData.classroom,
          department,
          semester: formData.year,
          student_group: formData.studentGroup,
          day: formData.day,
          time_slot: formData.timeSlot,
        }]);

      if (error) throw error;

      toast({
        title: "Class Added",
        description: `Successfully added ${formData.subjectName} to the timetable`,
      });

      // Reset form and close modal
      setFormData({
        subjectId: "",
        subjectCode: "",
        subjectName: "",
        subjectType: "",
        labDuration: 0,
        staff: "",
        classroom: "",
        studentGroup: "",
        year: "",
        day: "",
        timeSlot: "",
      });
      onClose();
    } catch (error: any) {
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
    <AnimatePresence>
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
                    <Label htmlFor="subjectId" className="text-foreground">Subject Name</Label>
                    {loadingSubjects ? (
                      <div className="flex items-center justify-center p-3 border border-border rounded-md">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                        <span className="ml-2 text-sm">Loading subjects...</span>
                      </div>
                    ) : (
                      <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
<SelectContent>
  {availableSubjects.map((subject) => (
    <SelectItem key={subject.id} value={subject.id}>
      {subject.name} – {subject.code} ({subject.type}
      {subject.type === "lab" && subject.lab_duration
        ? `, ${subject.lab_duration}P`
        : ""}
      )
    </SelectItem>
  ))}
</SelectContent>


                      </Select>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="subjectCode" className="text-foreground">Subject Code</Label>
                    <Input
                      id="subjectCode"
                      value={formData.subjectCode}
                      readOnly
                      placeholder="e.g., CS8391"
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                {formData.subjectId && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{formData.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formData.subjectType === 'lab' ? `Lab Subject (${formData.labDuration} periods)` : 'Theory Subject'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{formData.year} Year</Badge>
                        <Badge variant="secondary">{formData.subjectType}</Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Select
                      value={formData.year}
                      onValueChange={(value) => handleInputChange("year", value)}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="day" className="text-foreground">Day</Label>
                    <Select
                      value={formData.day}
                      onValueChange={(value) => handleInputChange("day", value)}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select Day" />
                      </SelectTrigger>
                      <SelectContent>
                        
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeSlot" className="text-foreground">Time Slot</Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) => handleInputChange("timeSlot", value)}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent>
                        
                        <SelectItem value="08:00-09:00">08:00-09:00</SelectItem>
                        <SelectItem value="09:00-10:00">09:00-10:00</SelectItem>
                        <SelectItem value="10:15-11:15">10:15-11:15</SelectItem>
                        <SelectItem value="11:15-12:15">11:15-12:15</SelectItem>
                        <SelectItem value="13:15-14:15">13:15-14:15</SelectItem>
                        <SelectItem value="14:15-15:15">14:15-15:15</SelectItem>
                        <SelectItem value="15:30-16:30">15:30-16:30</SelectItem>
                        <SelectItem value="16:30-17:30">16:30-17:30</SelectItem>
                      </SelectContent>
                    </Select>
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
    </AnimatePresence>
  );
};
export default AddClassModal;