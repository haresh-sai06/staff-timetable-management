import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  department: string;
}

interface ClassEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
  labDuration: number;
  staff: string;
  classroom: string;
  studentGroup: string;
  year: string;
  day: string;
  timeSlot: string;
  type: string;
}

const EditClassModal = ({ isOpen, onClose, entryId, department }: EditClassModalProps) => {
  const [formData, setFormData] = useState<ClassEntry>({
    id: "",
    subjectId: "",
    subjectName: "",
    subjectCode: "",
    subjectType: "",
    labDuration: 0,
    staff: "",
    classroom: "",
    studentGroup: "",
    year: "",
    day: "",
    timeSlot: "",
    type: "theory"
  });
  const [availableSubjects, setAvailableSubjects] = useState<Tables<"subjects">[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && entryId) {
      fetchClassData();
      fetchSubjects();
    }
  }, [isOpen, entryId]);

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

  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to fetch class data
      // In real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data based on entryId - replace with actual API call
      const mockData: ClassEntry = {
        id: entryId,
        subjectId: "1",
        subjectName: "Data Structures",
        subjectCode: "CS8391",
        subjectType: "theory",
        labDuration: 0,
        staff: "Dr. Priya Sharma",
        classroom: "CSE-101",
        studentGroup: "CSE-3A",
        year: "3",
        day: "Monday",
        timeSlot: "09:15-10:10",
        type: "theory"
      };
      
      setFormData(mockData);
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClassEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Updating class:", { ...formData, department });
      
      toast({
        title: "Class Updated",
        description: `Successfully updated ${formData.subjectName}`,
      });
      
      onClose();
      
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
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
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-accent" />
              <span>Edit Class</span>
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
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <span className="ml-2">Loading class data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject" className="text-foreground">Subject Name</Label>
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
    <SelectItem
      key={subject.id}
      value={subject.id}
      className="flex items-center justify-between w-full"
    >
      <span className="truncate">{subject.name}</span>
      <span className="flex items-center space-x-1 ml-2">
        <Badge variant="outline" className="text-xs">
          {subject.code}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {subject.type}
        </Badge>
        {subject.type === "lab" && subject.lab_duration && (
          <Badge variant="outline" className="text-xs">
            {subject.lab_duration}P
          </Badge>
        )}
      </span>
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
                      <option value="09:15-10:10">09:15-10:10 (Period 1)</option>
                      <option value="10:10-11:05">10:10-11:05 (Period 2)</option>
                      <option value="11:20-12:15">11:20-12:15 (Period 3)</option>
                      <option value="13:00-13:55">13:00-13:55 (Period 4)</option>
                      <option value="13:55-14:50">13:55-14:50 (Period 5)</option>
                      <option value="14:50-15:45">14:50-15:45 (Period 6)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-foreground">Class Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    >
                      <option value="theory">Theory</option>
                      <option value="lab">Lab</option>
                      <option value="tutorial">Tutorial</option>
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
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Update Class</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EditClassModal;