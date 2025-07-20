
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface Staff {
  id?: string;
  name: string;
  email: string;
  department: string;
  role: string;
  max_hours: number;
  current_hours: number;
  subjects: string[];
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
  const { toast } = useToast();

  const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];
  const roles = ["Prof", "AsstProf", "AssocProf"];

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
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (staff?.id) {
        // Update existing staff
        const { error } = await supabase
          .from('staff')
          .update(formData)
          .eq('id', staff.id);

        if (error) throw error;
        toast({ title: "Success", description: "Staff member updated successfully" });
      } else {
        // Create new staff
        const { error } = await supabase
          .from('staff')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Staff member added successfully" });
      }
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectCode: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectCode]);
    } else {
      setSelectedSubjects(prev => prev.filter(code => code !== subjectCode));
    }
  };

  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department }));
    setSelectedSubjects([]); // Clear selected subjects when department changes
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{staff ? "Edit Staff Member" : "Add New Staff Member"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department *</Label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                required
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                required
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === "Prof" ? "Professor" : role === "AsstProf" ? "Assistant Professor" : "Associate Professor"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_hours">Max Hours</Label>
              <Input
                id="max_hours"
                type="number"
                value={formData.max_hours}
                onChange={(e) => setFormData({...formData, max_hours: parseInt(e.target.value)})}
                min="1"
                max="30"
              />
            </div>
            <div>
              <Label htmlFor="current_hours">Current Hours</Label>
              <Input
                id="current_hours"
                type="number"
                value={formData.current_hours}
                onChange={(e) => setFormData({...formData, current_hours: parseInt(e.target.value)})}
                min="0"
                max="30"
              />
            </div>
          </div>

          <div>
            <Label>Assigned Subjects</Label>
            {loadingSubjects ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading subjects...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
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
                          <span>{subject.name}</span>
                          <div className="flex items-center space-x-2">
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
            )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="is_active">Active Status</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : (staff ? "Update Staff" : "Add Staff")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaffForm;
