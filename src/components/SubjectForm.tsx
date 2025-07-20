import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id?: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  is_active: boolean;
}

interface SubjectFormProps {
  subject?: Subject;
  onSave: () => void;
  onCancel: () => void;
}

const SubjectForm = ({ subject, onSave, onCancel }: SubjectFormProps) => {
  const [formData, setFormData] = useState<Subject>({
    name: subject?.name || "",
    code: subject?.code || "",
    department: subject?.department || "CSE",
    credits: subject?.credits || 3,
    is_active: subject?.is_active !== undefined ? subject.is_active : true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (subject?.id) {
        // Update existing subject
        const { error } = await supabase
          .from('subjects')
          .update({
            name: formData.name,
            code: formData.code,
            department: formData.department,
            credits: formData.credits,
            is_active: formData.is_active,
          })
          .eq('id', subject.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        // Add new subject
        const { error } = await supabase
          .from('subjects')
          .insert([{
            id: crypto.randomUUID(),
            name: formData.name,
            code: formData.code,
            department: formData.department,
            credits: formData.credits,
            is_active: formData.is_active,
          }]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Subject added successfully",
        });
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast({
        title: "Error",
        description: "Failed to save subject",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "credits" ? parseInt(value) : value,
    }));
  };

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-montserrat text-foreground">
          {subject ? "Edit Subject" : "Add New Subject"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-foreground">Subject Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Data Structures"
              required
              className="bg-card/80 border-border"
            />
          </div>
          <div>
            <Label htmlFor="code" className="text-foreground">Subject Code</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., CS101"
              required
              className="bg-card/80 border-border"
            />
          </div>
          <div>
            <Label htmlFor="department" className="text-foreground">Department</Label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-card/80 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="credits" className="text-foreground">Credits</Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              value={formData.credits}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
              className="bg-card/80 border-border"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active" className="text-foreground">Active</Label>
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubjectForm;