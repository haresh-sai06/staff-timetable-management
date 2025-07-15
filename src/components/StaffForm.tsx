
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];
  const roles = ["Prof", "AsstProf", "AssocProf"];

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

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
      setNewSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
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
                onChange={(e) => setFormData({...formData, department: e.target.value})}
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
            <Label>Subjects</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a subject"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              />
              <Button type="button" onClick={addSubject} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {subject}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSubject(subject)}
                  />
                </Badge>
              ))}
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
