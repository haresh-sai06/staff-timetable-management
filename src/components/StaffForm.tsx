import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface Staff {
  id?: string;
  name: string;
  email: string;
  department: string;
  role: string;
  max_hours: number;
  current_hours: number;
  subjects: string[] | null;
  is_active: boolean;
}

interface StaffFormProps {
  staff?: Staff;
  onSave: () => void;
  onCancel: () => void;
}

const StaffForm = ({ staff, onSave, onCancel }: StaffFormProps) => {
  const [formData, setFormData] = useState<Staff>({
    name: staff?.name || "",
    email: staff?.email || "",
    department: staff?.department || "CSE",
    role: staff?.role || "AsstProf",
    max_hours: staff?.max_hours || 18,
    current_hours: staff?.current_hours || 0,
    subjects: staff?.subjects || [],
    is_active: staff?.is_active ?? true,
  });
  const [availableSubjects, setAvailableSubjects] = useState<Tables<"subjects">[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(staff?.subjects || []);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];
  const roles = ["Prof", "AsstProf", "AssocProf"];
  const subjectTypes = ["lecture", "lab", "seminar"];

  useEffect(() => {
    fetchSubjects();
  }, [formData.department]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, subjects: selectedSubjects }));
  }, [selectedSubjects]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('department', formData.department)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error("Failed to fetch subjects: " + error.message);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleInputChange = (field: keyof Staff, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subjectCode: string, checked: boolean) => {
    setSelectedSubjects(prev =>
      checked ? [...prev, subjectCode] : prev.filter(code => code !== subjectCode)
    );
  };

  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department, subjects: [] }));
    setSelectedSubjects([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ["name", "email", "department", "role"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof Staff]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      if (staff?.id) {
        // Update existing staff
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            email: formData.email,
            department: formData.department,
            role: formData.role,
            max_hours: formData.max_hours,
            current_hours: formData.current_hours,
            subjects: formData.subjects,
            is_active: formData.is_active,
          })
          .eq('id', staff.id);

        if (error) throw error;
        toast.success("Staff member updated successfully");
      } else {
        // Create new staff
        const { error } = await supabase
          .from('staff')
          .insert([{
            id: crypto.randomUUID(),
            name: formData.name,
            email: formData.email,
            department: formData.department,
            role: formData.role,
            max_hours: formData.max_hours,
            current_hours: formData.current_hours,
            subjects: formData.subjects,
            is_active: formData.is_active,
          }]);

        if (error) throw error;
        toast.success("Staff member added successfully");
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      toast.error("Failed to save staff: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-card/80 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-foreground font-montserrat">
                {staff ? "Edit Staff Member" : "Add New Staff Member"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Dr. Priya Sharma"
                      required
                      className="bg-card/80 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="e.g., priya.sharma@university.edu"
                      required
                      className="bg-card/80 border-border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-foreground">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={handleDepartmentChange}
                    >
                      <SelectTrigger className="bg-card/80 border-border">
                        <SelectValue placeholder="Select department" />
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
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleInputChange("role", value)}
                    >
                      <SelectTrigger className="bg-card/80 border-border">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role === "Prof" ? "Professor" : role === "AsstProf" ? "Assistant Professor" : "Associate Professor"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_hours" className="text-foreground">Max Hours</Label>
                    <Input
                      id="max_hours"
                      type="number"
                      value={formData.max_hours}
                      onChange={(e) => handleInputChange("max_hours", parseInt(e.target.value))}
                      min="1"
                      max="30"
                      className="bg-card/80 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_hours" className="text-foreground">Current Hours</Label>
                    <Input
                      id="current_hours"
                      type="number"
                      value={formData.current_hours}
                      onChange={(e) => handleInputChange("current_hours", parseInt(e.target.value))}
                      min="0"
                      max="30"
                      className="bg-card/80 border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Assigned Subjects</Label>
                  {loadingSubjects ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Loading subjects...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-card/80">
                      {availableSubjects.length > 0 ? (
                        availableSubjects.map((subject) => (
                          <div key={subject.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject.id}
                              checked={selectedSubjects.includes(subject.code)}
                              onCheckedChange={(checked) => handleSubjectToggle(subject.code, checked as boolean)}
                            />
                            <Label htmlFor={subject.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <span>{subject.name} (Year {subject.year})</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {subject.code}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {subject.type}
                                  </Badge>
                                  {subject.type === 'lab' && subject.lab_duration && (
                                    <Badge variant="outline" className="text-xs">
                                      {subject.lab_duration}h
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No subjects available for {formData.department} department
                        </p>
                      )}
                    </div>
                  )}
                  {selectedSubjects.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Selected: {selectedSubjects.length} subjects</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSubjects.map((subjectCode) => {
                          const subject = availableSubjects.find(s => s.code === subjectCode);
                          return (
                            <Badge key={subjectCode} variant="secondary" className="text-xs">
                              {subject?.name || subjectCode}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-background">
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked as boolean)}
                  />
                  <Label htmlFor="is_active" className="text-foreground">Active</Label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? (
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
                    {loading ? "Saving..." : (staff ? "Update Staff" : "Add Staff")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 border-border text-foreground"
                  >
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

export default StaffForm;