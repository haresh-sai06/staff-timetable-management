import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  subjects: string[];
  max_hours: number;
  current_hours: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  is_active: boolean;
}

export default function StaffManagementTest() {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaff = async () => {
    try {
      console.log('🔍 Fetching all staff data...');
      const { data: staffResult, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (staffError) throw staffError;

      console.log('📊 Raw staff data from database:', staffResult);
      setStaffData(staffResult || []);
      
      // Log specific staff members
      const gomathy = staffResult?.find(s => s.name.includes('Gomathy'));
      if (gomathy) {
        console.log('👩‍🏫 Mrs.L.Gomathy found:', gomathy);
        console.log('📚 Her subjects:', gomathy.subjects);
      } else {
        console.log('❌ Mrs.L.Gomathy not found in results');
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching staff:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      console.log('🔍 Fetching all subjects data...');
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      console.log('📖 Subjects data from database:', data);
      setSubjects(data || []);
      
      // Log the specific subject we're looking for
      const pythonStats = data?.find(s => s.name.includes('Applied Statistics using Python'));
      if (pythonStats) {
        console.log('🐍 Applied Statistics using Python found:', pythonStats);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching subjects:', error);
    }
  };

  const testAssignment = async () => {
    console.log('\n🧪 TESTING SUBJECT ASSIGNMENT FOR MRS.L.GOMATHY');
    
    const gomathy = staffData.find(s => s.name.includes('Gomathy'));
    const pythonStats = subjects.find(s => s.name.includes('Applied Statistics using Python'));
    
    if (!gomathy) {
      console.log('❌ Mrs.L.Gomathy not found');
      return;
    }
    
    if (!pythonStats) {
      console.log('❌ Applied Statistics using Python subject not found');
      return;
    }
    
    console.log('✅ Found Mrs.L.Gomathy:', gomathy.name);
    console.log('✅ Found Python Stats subject:', pythonStats.name, pythonStats.id);
    
    console.log('📝 Current subjects for Mrs.L.Gomathy:', gomathy.subjects);
    
    // Test if the subject is already assigned
    if (gomathy.subjects.includes(pythonStats.id)) {
      console.log('✅ Subject is already assigned to Mrs.L.Gomathy!');
    } else {
      console.log('❌ Subject is NOT assigned to Mrs.L.Gomathy');
      console.log('Expected subject ID:', pythonStats.id);
      console.log('Actual subjects array:', gomathy.subjects);
    }
    
    // Test assignment
    try {
      const updatedSubjects = [...new Set([...gomathy.subjects, pythonStats.id])];
      console.log('🔄 Attempting to update subjects to:', updatedSubjects);
      
      const { data: updatedStaff, error } = await supabase
        .from('staff')
        .update({ 
          subjects: updatedSubjects,
          updated_at: new Date().toISOString()
        })
        .eq('id', gomathy.id)
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Update successful:', updatedStaff);
      
      toast({
        title: "Success",
        description: "Subject assignment updated successfully",
      });
      
      // Refresh data
      await fetchStaff();
      
    } catch (error: any) {
      console.error('❌ Error updating assignment:', error);
      toast({
        title: "Error",
        description: `Failed to update assignment: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStaff(), fetchSubjects()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading test data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff-Subject Assignment Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testAssignment} className="mb-4">
              Test Assignment for Mrs.L.Gomathy
            </Button>
            
            <div>
              <h3 className="font-semibold mb-2">Staff Data ({staffData.length} total):</h3>
              {staffData.map((staff) => (
                <Card key={staff.id} className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{staff.name}</h4>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                        <p className="text-sm">{staff.department} - {staff.role}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Subjects ({staff.subjects?.length || 0}):</p>
                        <div className="flex flex-wrap gap-1">
                          {staff.subjects && staff.subjects.length > 0 ? (
                            staff.subjects.map((subjectId, idx) => {
                              const subject = subjects.find(s => s.id === subjectId);
                              return (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {subject ? `${subject.name}` : `Unknown: ${subjectId}`}
                                </Badge>
                              );
                            })
                          ) : (
                            <Badge variant="outline" className="text-xs">No subjects</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Available Subjects ({subjects.length} total):</h3>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject.id} variant="outline" className="p-2 justify-start">
                    {subject.name} ({subject.code})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}