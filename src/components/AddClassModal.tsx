import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  semester: string;
  onRefresh: () => void;
  day?: string;
  timeSlot?: string;
}

const AddClassModal = ({ isOpen, onClose, department, semester, onRefresh, day, timeSlot }: AddClassModalProps) => {
  const [formData, setFormData] = useState({
    subjectId: "",
    staffId: "",
    classroomId: "",
    studentGroup: "",
    day: day || "",
    timeSlot: timeSlot || ""
  });
  
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, department]);

  useEffect(() => {
    // Filter staff based on selected subject (by subject ID, not name)
    if (formData.subjectId && availableStaff.length > 0) {
      console.log("Filtering staff for subject ID:", formData.subjectId);
      const staffWithSubject = availableStaff.filter(staff => 
        staff.subjects && staff.subjects.includes(formData.subjectId)
      );
      console.log("Staff with this subject:", staffWithSubject);
      setFilteredStaff(staffWithSubject);
    } else {
      setFilteredStaff([]);
    }
  }, [formData.subjectId, availableStaff]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [subjectsResult, staffResult, classroomsResult] = await Promise.all([
        supabase
          .from('subjects')
          .select('*')
          .contains('departments', [department])
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('staff')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('classrooms')
          .select('*')
          .eq('is_active', true)
          .order('name'),
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
    "08:00-09:00", "09:00-10:00", "10:15-11:15", 
    "11:15-12:15", "13:00-14:00", "14:00-15:00", "15:15-16:15"
  ];
  

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const requiredFields = ['subjectId', 'staffId', 'classroomId', 'studentGroup', 'day', 'timeSlot'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const selectedSubject = availableSubjects.find(s => s.id === formData.subjectId);
      
      const { error } = await supabase
        .from('timetable_entries')
        .insert([{
          subject_code: selectedSubject?.code,
          staff_id: formData.staffId,
          classroom_id: formData.classroomId,
          department,
          semester,
          student_group: formData.studentGroup,
          day: formData.day,
          time_slot: formData.timeSlot,
        }]);

      if (error) throw error;
      
      toast.success("Class added successfully!");
      setFormData({
        subjectId: "",
        staffId: "",
        classroomId: "",
        studentGroup: "",
        day: day || "",
        timeSlot: timeSlot || ""
      });
      onRefresh();
      onClose();
    } catch (error: any) {
      console.error('Error adding class:', error);
      toast.error("Failed to add class: " + error.message);
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
              <CardTitle className="text-xl">Add New Class</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  <span className="ml-2">Loading data...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Department:</strong> {department} | <strong>Semester:</strong> {semester}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject *</Label>
                      <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code}) - {subject.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Staff Member *</Label>
                      <Select value={formData.staffId} onValueChange={(value) => handleInputChange("staffId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredStaff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Classroom *</Label>
                      <Select value={formData.classroomId} onValueChange={(value) => handleInputChange("classroomId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Classroom" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClassrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name} - {classroom.type} (Capacity: {classroom.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Student Group *</Label>
                      <Input
                        value={formData.studentGroup}
                        onChange={(e) => handleInputChange("studentGroup", e.target.value)}
                        placeholder="e.g., CSE-3A"
                      />
                    </div>
                  </div>

                  {day && timeSlot && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Selected Slot:</strong> {day} at {timeSlot}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Adding Class...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Class
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddClassModal;