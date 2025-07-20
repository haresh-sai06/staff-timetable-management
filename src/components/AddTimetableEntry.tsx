import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface AddTimetableEntryProps {
  onClose: () => void;
  department: string;
  semester: string;
}

const AddTimetableEntry = ({ onClose, department, semester }: AddTimetableEntryProps) => {
  const [formData, setFormData] = useState({
    subjectId: "",
    subjectCode: "",
    subjectName: "",
    subjectType: "",
    labDuration: 0,
    staff: "",
    staffRole: "",
    classroom: "",
    studentGroup: "",
    year: "",
    day: "",
    timeSlot: ""
  });
  const [availableSubjects, setAvailableSubjects] = useState<Tables<"subjects">[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Tables<"staff">[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<Tables<"classrooms">[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [department, semester]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [subjectsResult, staffResult, classroomsResult] = await Promise.all([
        supabase
          .from('subjects')
          .select('*')
          .eq('department', department)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('staff')
          .select('*')
          .eq('department', department)
          .eq('is_active', true),
        supabase
          .from('classrooms')
          .select('*')
          .eq('is_active', true),
      ]);

      if (subjectsResult.error) throw subjectsResult.error;
      if (staffResult.error) throw staffResult.error;
      if (classroomsResult.error) throw classroomsResult.error;

      setAvailableSubjects(subjectsResult.data || []);
      setAvailableStaff(staffResult.data || []);
      setAvailableClassrooms(classroomsResult.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "09:15-10:10", "10:10-11:05", "11:20-12:15", 
    "13:00-13:55", "13:55-14:50", "14:50-15:45"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    
    if (field === "timeSlot" || field === "staff" || field === "classroom") {
      checkConflicts({ ...formData, [field]: value });
    }
  };

  const checkConflicts = async (data: typeof formData) => {
    const newConflicts: string[] = [];
    
    if (data.staff) {
      const staff = availableStaff.find(s => s.id === data.staff);
      if (staff && staff.current_hours >= staff.max_hours) {
        newConflicts.push(`${staff.name} has reached maximum workload (${staff.max_hours} hours)`);
      }

      const { data: staffBookings, error: staffError } = await supabase
        .from('timetable_entries')
        .select('id')
        .eq('staff_id', data.staff)
        .eq('day', data.day)
        .eq('time_slot', data.timeSlot);
      
      if (staffError) {
        console.error('Error checking staff conflicts:', staffError);
        toast.error("Failed to check staff conflicts");
      } else if (staffBookings?.length > 0) {
        newConflicts.push(`${staff?.name} is already assigned for ${data.day} ${data.timeSlot}`);
      }
    }
    
    if (data.classroom && data.timeSlot && data.day) {
      const { data: classroomBookings, error: classroomError } = await supabase
        .from('timetable_entries')
        .select('id')
        .eq('classroom_id', data.classroom)
        .eq('day', data.day)
        .eq('time_slot', data.timeSlot);
      
      if (classroomError) {
        console.error('Error checking classroom conflicts:', classroomError);
        toast.error("Failed to check classroom conflicts");
      } else if (classroomBookings?.length > 0) {
        newConflicts.push(`${data.classroom} is already booked for ${data.day} ${data.timeSlot}`);
      }
    }
    
    setConflicts(newConflicts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const requiredFields = ['subjectId', 'staff', 'classroom', 'studentGroup', 'day', 'timeSlot'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const staff = availableStaff.find(s => s.id === formData.staff);
      const classroom = availableClassrooms.find(c => c.id === formData.classroom);
      
      const { error } = await supabase
        .from('timetable_entries')
        .insert([{
          subject_code: formData.subjectCode,
          staff_id: staff?.id,
          classroom_id: classroom?.id,
          department,
          semester,
          student_group: formData.studentGroup,
          day: formData.day,
          time_slot: formData.timeSlot,
        }]);

      if (error) throw error;
      
      toast.success("Timetable entry added successfully!");
      setFormData({
        subjectId: "",
        subjectCode: "",
        subjectName: "",
        subjectType: "",
        labDuration: 0,
        staff: "",
        staffRole: "",
        classroom: "",
        studentGroup: "",
        year: "",
        day: "",
        timeSlot: ""
      });
      onClose();
    } catch (error: any) {
      console.error('Error adding timetable entry:', error);
      toast.error("Failed to add timetable entry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading data...</span>
      </div>
    );
  }

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
              <CardTitle className="text-xl">Add Timetable Entry</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Department:</strong> {department} | <strong>Semester:</strong> {semester}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Subject</Label>
                    <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
<SelectContent>
  {availableSubjects.map((subject) => (
    <SelectItem
      key={subject.id}
      value={subject.id}
      className="flex items-center justify-between w-full space-x-2"
    >
      <span className="truncate">{subject.name}</span>
      <span className="flex items-center space-x-1 ml-auto">
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectCode">Subject Code</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="staff">Staff Member</Label>
                      <Select value={formData.staff} onValueChange={(value) => handleInputChange("staff", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStaff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role}) - {staff.current_hours}/{staff.max_hours}h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentGroup">Student Group</Label>
                      <Input
                        id="studentGroup"
                        value={formData.studentGroup}
                        onChange={(e) => handleInputChange("studentGroup", e.target.value)}
                        placeholder="e.g., CSE-3A"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="day">Day</Label>
                      <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeSlot">Time Slot</Label>
                      <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange("timeSlot", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classroom">Classroom</Label>
                    <Select value={formData.classroom} onValueChange={(value) => handleInputChange("classroom", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClassrooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} - {room.type} (Capacity: {room.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {conflicts.length > 0 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>Conflicts detected:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {conflicts.map((conflict, index) => (
                            <li key={index}>{conflict}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || conflicts.length > 0}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 mr-2"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {isSubmitting ? "Adding Entry..." : "Add Entry"}
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

  export default AddTimetableEntry;