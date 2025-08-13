import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Building, Calendar, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TutorAssignmentModalProps {
  staffId: string;
  staffName: string;
  department: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: string;
  is_active: boolean;
}

interface TutorAssignment {
  id: string;
  classroom: string;
  academic_year: string;
  year_group: string;
  is_active: boolean;
  department: string;
}

const TutorAssignmentModal = ({ staffId, staffName, department, isOpen, onClose, onSuccess }: TutorAssignmentModalProps) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [yearGroup, setYearGroup] = useState("1st Year");
  const [existingAssignments, setExistingAssignments] = useState<TutorAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

const academicYears = ["2024-2028", "2025-2029", "2026-2030"];
  const yearGroups = ["1st Year", "2-4th Year"];

  useEffect(() => {
    if (isOpen) {
      fetchClassrooms();
      fetchExistingAssignments();
    }
  }, [isOpen, department]);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('id, name, capacity, type, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Filter out classrooms with empty or null names
      const validClassrooms = (data || []).filter(
        classroom => classroom.name && classroom.name.trim() !== ""
      );

      if (validClassrooms.length !== (data || []).length) {
        console.warn("Some classrooms were filtered out due to empty or invalid names:", data);
        toast({
          title: "Warning",
          description: "Some classrooms have invalid names and were excluded.",
          variant: "default",
        });
      }

      setClassrooms(validClassrooms);
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classrooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_assignments')
        .select('id, classroom, academic_year, year_group, is_active, department')
        .eq('staff_id', staffId)
        .eq('is_active', true);

      if (error) throw error;

      // Filter out assignments with empty or null classroom names
      const validAssignments = (data || []).filter(
        assignment => assignment.classroom && assignment.classroom.trim() !== ""
      );

      if (validAssignments.length !== (data || []).length) {
        console.warn("Some assignments were filtered out due to empty or invalid classroom names:", data);
        toast({
          title: "Warning",
          description: "Some assignments have invalid classroom names and were excluded.",
          variant: "default",
        });
      }

      setExistingAssignments(validAssignments);
    } catch (error: any) {
      console.error('Error fetching existing assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing assignments",
        variant: "destructive",
      });
    }
  };

  const handleAssignTutor = async () => {
    if (!selectedClassroom) {
      toast({
        title: "Validation Error",
        description: "Please select a classroom",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const classroom = classrooms.find(c => c.name === selectedClassroom);
      if (!classroom) {
        throw new Error("Selected classroom not found");
      }

      const { error } = await supabase
        .from('tutor_assignments')
        .insert({
          staff_id: staffId,
          classroom: selectedClassroom,
          department,
          academic_year: academicYear,
          year_group: yearGroup,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${staffName} has been assigned as tutor for ${selectedClassroom}`,
      });

      onSuccess();
      onClose();
      setSelectedClassroom("");
    } catch (error: any) {
      console.error('Error assigning tutor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign tutor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('tutor_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tutor assignment removed successfully",
      });

      fetchExistingAssignments();
      onSuccess();
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove tutor assignment",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Users className="h-5 w-5 text-accent" />
              <span>Tutor Assignment - {staffName}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {existingAssignments.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Current Assignments</Label>
                <div className="grid gap-2">
                  {existingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assignment.classroom}</p>
                           <p className="text-sm text-muted-foreground">
                             {assignment.academic_year} - {assignment.year_group}
                           </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium">Assign New Classroom</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                 <div className="space-y-2">
                   <Label>Year Group</Label>
                   <Select value={yearGroup} onValueChange={setYearGroup}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {yearGroups.map((group) => (
                         <SelectItem key={group} value={group}>
                           {group}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div className="space-y-2">
                <Label>Classroom</Label>
                <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-2">
                        No valid classrooms available
                      </div>
                    ) : (
                      classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.name}>
                          {classroom.name} - {classroom.type} (Capacity: {classroom.capacity})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAssignTutor} 
                disabled={loading || !selectedClassroom}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Assigning..." : "Assign Tutor"}
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TutorAssignmentModal;