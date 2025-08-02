import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubjectDropdownSelectorProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
}

const SubjectDropdownSelector = ({ selectedSubjects, onSubjectsChange }: SubjectDropdownSelectorProps) => {
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error("Failed to fetch subjects: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    if (!selectedSubjectId) return;
    
    const subject = availableSubjects.find(s => s.id === selectedSubjectId);
    if (!subject) return;
    
    if (!selectedSubjects.includes(subject.name)) {
      onSubjectsChange([...selectedSubjects, subject.name]);
    }
    setSelectedSubjectId("");
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    onSubjectsChange(selectedSubjects.filter(subject => subject !== subjectToRemove));
  };

  const unselectedSubjects = availableSubjects.filter(
    subject => !selectedSubjects.includes(subject.name)
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span className="text-sm">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a subject to add" />
          </SelectTrigger>
          <SelectContent>
            {unselectedSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name} ({subject.code}) - {subject.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="button" 
          onClick={handleAddSubject} 
          size="sm"
          disabled={!selectedSubjectId}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSubjects.map((subject, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {subject}
              <button
                type="button"
                onClick={() => handleRemoveSubject(subject)}
                className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectDropdownSelector;