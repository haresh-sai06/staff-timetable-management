import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface EditSubjectProps {
  subject: Tables<"subjects">;
  onClose: () => void;
  onSave: () => void;
}

const EditSubject = ({ subject, onClose, onSave }: EditSubjectProps) => {
  const [formData, setFormData] = useState<Tables<"subjects">>({
    id: subject?.id || crypto.randomUUID(),
    name: subject?.name || "",
    code: subject?.code || "",
    department: subject?.department || "CSE",
    credits: subject?.credits || 3,
    type: subject?.type || null,
    lab_duration: subject?.lab_duration || null,
    year: subject?.year || null,
    is_active: subject?.is_active ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];
  const subjectTypes = ["lecture", "lab", "seminar"];
  const years = [1, 2, 3, 4];

  const handleInputChange = (field: keyof Tables<"subjects">, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = ["name", "code", "department", "credits"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof Tables<"subjects">]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: formData.name,
          code: formData.code,
          department: formData.department,
          credits: formData.credits,
          type: formData.type,
          lab_duration: formData.lab_duration,
          year: formData.year,
          is_active: formData.is_active,
        })
        .eq('id', formData.id);

      if (error) throw error;

      toast.success("Subject updated successfully!");
      onSave();
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast.error("Failed to update subject: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
          <Card className="bg-card/80 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-foreground font-montserrat">Edit Subject</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Data Structures"
                    required
                    className="bg-card/80 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-foreground">Subject Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="e.g., CS101"
                    required
                    className="bg-card/80 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-foreground">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
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
                  <Label htmlFor="credits" className="text-foreground">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => handleInputChange("credits", parseInt(e.target.value))}
                    min="1"
                    max="10"
                    required
                    className="bg-card/80 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">Type</Label>
                  <Select
                    value={formData.type || ""}
                    onValueChange={(value) => handleInputChange("type", value || null)}
                  >
                    <SelectTrigger className="bg-card/80 border-border">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {subjectTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab_duration" className="text-foreground">Lab Duration (hours)</Label>
                  <Input
                    id="lab_duration"
                    type="number"
                    value={formData.lab_duration || ""}
                    onChange={(e) => handleInputChange("lab_duration", e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                    max="10"
                    className="bg-card/80 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-foreground">Year</Label>
                  <Select
                    value={formData.year?.toString() || ""}
                    onValueChange={(value) => handleInputChange("year", value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="bg-card/80 border-border">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active" className="text-foreground">Active</Label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
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
                    {isSubmitting ? "Updating Subject..." : "Update Subject"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
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

export default EditSubject;