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
import { toast as sonnerToast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  department: string;
  semester?: string;
  year?: string;
  onRefresh?: () => void;
}

interface ClassEntry {
  id: string;
  subjectId: string;
  staffId: string;
  classroomId: string;
  studentGroup: string;
  day: string;
  timeSlot: string;
  semester: string;
  department: string;
}

const EditClassModal = ({ isOpen, onClose, entryId, department, semester = "odd", year = "3", onRefresh }: EditClassModalProps) => {
  const [formData, setFormData] = useState<ClassEntry>({
    id: "",
    subjectId: "",
    staffId: "",
    classroomId: "",
    studentGroup: "",
    day: "",
    timeSlot: "",
    semester,
    department
  });
  const [availableSubjects, setAvailableSubjects] = useState<Tables<"subjects">[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Tables<"staff">[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<Tables<"classrooms">[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Tables<"staff">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && entryId) {
      fetchData();
      fetchClassData();
    }
  }, [isOpen, entryId, department]);

  useEffect(() => {
    if (formData.subjectId) {
      const filtered = availableStaff.filter(staff => 
        staff.subjects && staff.subjects.includes(formData.subjectId)
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff(availableStaff);
    }
  }, [formData.subjectId, availableStaff]);

  const fetchData = async () => {
    try {
      const [subjectsResponse, staffResponse, classroomsResponse] = await Promise.all([
        supabase
          .from('subjects')
          .select('*')
          .eq('department', department)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('staff')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('classrooms')
          .select('*')
          .eq('is_active', true)
          .order('name')
      ]);

      if (subjectsResponse.error) throw subjectsResponse.error;
      if (staffResponse.error) throw staffResponse.error;
      if (classroomsResponse.error) throw classroomsResponse.error;

      setAvailableSubjects(subjectsResponse.data || []);
      setAvailableStaff(staffResponse.data || []);
      setAvailableClassrooms(classroomsResponse.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      const yearNum = parseInt(year);
      let tableName: any;
      
      switch(yearNum) {
        case 1: tableName = 'timetable_year_1'; break;
        case 2: tableName = 'timetable_year_2'; break;
        case 3: tableName = 'timetable_year_3'; break;
        case 4: tableName = 'timetable_year_4'; break;
        default: tableName = 'timetable_entries';
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', entryId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          id: (data as any).id || "",
          subjectId: (data as any).subject_code || "",
          staffId: (data as any).staff_id || "",
          classroomId: (data as any).classroom_id || "",
          studentGroup: (data as any).student_group || "",
          day: (data as any).day || "",
          timeSlot: (data as any).time_slot || "",
          semester: (data as any).semester || semester,
          department: (data as any).department || department
        });
      }
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const yearNum = parseInt(year);
      let tableName: any;
      
      switch(yearNum) {
        case 1: tableName = 'timetable_year_1'; break;
        case 2: tableName = 'timetable_year_2'; break;
        case 3: tableName = 'timetable_year_3'; break;
        case 4: tableName = 'timetable_year_4'; break;
        default: tableName = 'timetable_entries';
      }

      const updateData = {
        subject_code: formData.subjectId,
        staff_id: formData.staffId,
        classroom_id: formData.classroomId,
        student_group: formData.studentGroup,
        day: formData.day,
        time_slot: formData.timeSlot,
        semester: formData.semester,
        department: formData.department
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', entryId);

      if (error) throw error;

      sonnerToast.success("Class updated successfully!");
      
      if (onRefresh) {
        onRefresh();
      }
      
      onClose();
      
    } catch (error) {
      console.error("Error updating class:", error);
      sonnerToast.error("Failed to update class. Please try again.");
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
                    <Label htmlFor="subject" className="text-foreground">Subject</Label>
                    <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{subject.name}</span>
                              <div className="flex items-center space-x-1 ml-2">
                                <Badge variant="outline" className="text-xs">
                                  {subject.code}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {subject.type}
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="staff" className="text-foreground">Staff</Label>
                    <Select value={formData.staffId} onValueChange={(value) => handleInputChange("staffId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{staff.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {staff.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="classroom" className="text-foreground">Classroom</Label>
                    <Select value={formData.classroomId} onValueChange={(value) => handleInputChange("classroomId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClassrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{classroom.name}</span>
                              <div className="flex items-center space-x-1 ml-2">
                                <Badge variant="outline" className="text-xs">
                                  {classroom.type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {classroom.capacity}
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="day" className="text-foreground">Day</Label>
                    <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)}>
                      <SelectTrigger>
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
                    <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange("timeSlot", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Time Slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:15-10:10">09:15-10:10 (Period 1)</SelectItem>
                        <SelectItem value="10:10-11:05">10:10-11:05 (Period 2)</SelectItem>
                        <SelectItem value="11:20-12:15">11:20-12:15 (Period 3)</SelectItem>
                        <SelectItem value="13:00-13:55">13:00-13:55 (Period 4)</SelectItem>
                        <SelectItem value="13:55-14:50">13:55-14:50 (Period 5)</SelectItem>
                        <SelectItem value="14:50-15:45">14:50-15:45 (Period 6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.day && formData.timeSlot && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.day} at {formData.timeSlot}
                    </p>
                  </div>
                )}
                
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