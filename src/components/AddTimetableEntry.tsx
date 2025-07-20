
import { useState } from "react";
import { useEffect } from "react";
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
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [department, semester]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('department', department)
        .eq('semester', semester === 'odd' ? 'odd' : 'even')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error("Failed to fetch subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "09:15-10:10", "10:10-11:05", "11:20-12:15", 
    "13:00-13:55", "13:55-14:50", "14:50-15:45"
  ];

  const staffMembers = [
    { name: "Dr. Priya Sharma", role: "AsstProf", currentHours: 15, maxHours: 18 },
    { name: "Prof. Rajesh Kumar", role: "Prof", currentHours: 10, maxHours: 12 },
    { name: "Dr. Anitha Reddy", role: "AsstProf", currentHours: 12, maxHours: 18 },
  ];

  const classrooms = [
    { name: "CSE-101", capacity: 60, type: "Lecture Hall" },
    { name: "CSE-102", capacity: 60, type: "Lecture Hall" },
    { name: "CSE-Lab1", capacity: 30, type: "Computer Lab" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill subject details when subject is selected
    if (field === "subjectId") {
      const selectedSubject = availableSubjects.find(s => s.id === value);
      if (selectedSubject) {
        setFormData(prev => ({ 
          ...prev, 
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          subjectType: selectedSubject.type,
          labDuration: selectedSubject.lab_duration || 0,
          year: selectedSubject.year
        }));
      }
    }
    
    // Check for conflicts when time slot, staff, or classroom changes
    if (field === "timeSlot" || field === "staff" || field === "classroom") {
      checkConflicts({ ...formData, [field]: value });
    }
  };

  const checkConflicts = (data: typeof formData) => {
    const newConflicts: string[] = [];
    
    // Check staff workload
    if (data.staff) {
      const staff = staffMembers.find(s => s.name === data.staff);
      if (staff && staff.currentHours >= staff.maxHours) {
        newConflicts.push(`${data.staff} has reached maximum workload (${staff.maxHours} hours)`);
      }
    }
    
    // Check classroom availability (mock check)
    if (data.classroom && data.timeSlot && data.day) {
      // In real app, this would check against existing bookings
      const isBooked = Math.random() > 0.8; // Mock 20% chance of conflict
      if (isBooked) {
        newConflicts.push(`${data.classroom} is already booked for ${data.day} ${data.timeSlot}`);
      }
    }
    
    setConflicts(newConflicts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    const requiredFields = Object.entries(formData);
    const missingFields = requiredFields.filter(([_, value]) => !value).map(([key, _]) => key);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Timetable entry added successfully!");
    setIsSubmitting(false);
    onClose();
  };

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
                {/* Current Context */}
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Department:</strong> {department} | <strong>Semester:</strong> {semester}
                  </p>
                </div>

                {/* Subject Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
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
                              <div className="flex items-center justify-between w-full">
                                <span>{subject.name}</span>
                                <div className="flex items-center space-x-1 ml-2">
                                  <Badge variant="outline" className="text-xs">
                                    {subject.code}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {subject.type}
                                  </Badge>
                                  {subject.type === 'lab' && subject.lab_duration && (
                                    <Badge variant="outline" className="text-xs">
                                      {subject.lab_duration}P
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    )}
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

                {/* Subject Details */}
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

                {/* Staff Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff">Staff Member</Label>
                    <Select value={formData.staff} onValueChange={(value) => handleInputChange("staff", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.name} value={staff.name}>
                            {staff.name} ({staff.role}) - {staff.currentHours}/{staff.maxHours}h
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

                {/* Schedule Information */}
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

                {/* Classroom */}
                <div className="space-y-2">
                  <Label htmlFor="classroom">Classroom</Label>
                  <Select value={formData.classroom} onValueChange={(value) => handleInputChange("classroom", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((room) => (
                        <SelectItem key={room.name} value={room.name}>
                          {room.name} - {room.type} (Capacity: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conflicts */}
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

                {/* Actions */}
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
