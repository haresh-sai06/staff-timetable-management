
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, BookOpen, GraduationCap, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  name: string;
  role: "Prof" | "AsstProf";
  department: string;
  maxHours: number;
  currentHours: number;
  allocatedHours: number;
  extraCurricular: {
    library: number;
    tutorWard: number;
    placement: number;
    departmental: number;
  };
}

interface StaffAllocationFormProps {
  selectedDepartment: string;
  onStaffAllocation: (staffData: StaffMember[]) => void;
}

const StaffAllocationForm = ({ selectedDepartment, onStaffAllocation }: StaffAllocationFormProps) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentStaff();
    }
  }, [selectedDepartment]);

  const fetchDepartmentStaff = () => {
    // Mock data - replace with actual API call
    const mockStaff: StaffMember[] = [
      {
        id: "1",
        name: "Dr. Priya Sharma",
        role: "Prof",
        department: selectedDepartment,
        maxHours: 12,
        currentHours: 8,
        allocatedHours: 0,
        extraCurricular: { library: 0, tutorWard: 0, placement: 0, departmental: 0 }
      },
      {
        id: "2",
        name: "Prof. Rajesh Kumar",
        role: "AsstProf",
        department: selectedDepartment,
        maxHours: 18,
        currentHours: 12,
        allocatedHours: 0,
        extraCurricular: { library: 0, tutorWard: 0, placement: 0, departmental: 0 }
      },
      {
        id: "3",
        name: "Dr. Meera Singh",
        role: "Prof",
        department: selectedDepartment,
        maxHours: 12,
        currentHours: 6,
        allocatedHours: 0,
        extraCurricular: { library: 0, tutorWard: 0, placement: 0, departmental: 0 }
      }
    ];
    setStaffList(mockStaff);
  };

  const updateStaffAllocation = (staffId: string, field: keyof StaffMember, value: any) => {
    setStaffList(prev => prev.map(staff => 
      staff.id === staffId ? { ...staff, [field]: value } : staff
    ));
  };

  const updateExtraCurricular = (staffId: string, type: keyof StaffMember['extraCurricular'], value: number) => {
    setStaffList(prev => prev.map(staff => 
      staff.id === staffId 
        ? { ...staff, extraCurricular: { ...staff.extraCurricular, [type]: value } }
        : staff
    ));
  };

  const getTotalAllocatedHours = (staff: StaffMember) => {
    const extraTotal = Object.values(staff.extraCurricular).reduce((sum, val) => sum + val, 0);
    return staff.allocatedHours + extraTotal;
  };

  const getRemainingHours = (staff: StaffMember) => {
    return staff.maxHours - staff.currentHours - getTotalAllocatedHours(staff);
  };

  const handleSaveAllocation = () => {
    onStaffAllocation(staffList);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glassmorphism-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Users className="h-5 w-5 text-accent" />
            <span>Staff Allocation - {selectedDepartment} Department</span>
            <p className="text-sm text-muted-foreground ml-4">(Note: Tutor assignments are now managed in Staff Management)</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {staffList.map((staff) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-border rounded-lg p-4 space-y-4 bg-card/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{staff.name}</h4>
                  <p className="text-sm text-muted-foreground">{staff.role} - {staff.department}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                    Current: {staff.currentHours}h
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                    Max: {staff.maxHours}h
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getRemainingHours(staff) >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}
                  >
                    Remaining: {getRemainingHours(staff)}h
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Core Teaching Hours */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Teaching Hours to Allocate</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={getRemainingHours(staff) + staff.allocatedHours}
                    value={staff.allocatedHours}
                    onChange={(e) => updateStaffAllocation(staff.id, 'allocatedHours', parseInt(e.target.value) || 0)}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              {/* Extra-curricular Activities */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>Extra-curricular Periods</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Library</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={staff.extraCurricular.library}
                      onChange={(e) => updateExtraCurricular(staff.id, 'library', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tutor Ward</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={staff.extraCurricular.tutorWard}
                      onChange={(e) => updateExtraCurricular(staff.id, 'tutorWard', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Placement (2h)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="3"
                      value={staff.extraCurricular.placement}
                      onChange={(e) => updateExtraCurricular(staff.id, 'placement', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Dept. Periods</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={staff.extraCurricular.departmental}
                      onChange={(e) => updateExtraCurricular(staff.id, 'departmental', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Hours Summary */}
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm text-muted-foreground">Total Allocated:</span>
                <span className="font-medium text-foreground">{getTotalAllocatedHours(staff)} hours</span>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveAllocation} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save Staff Allocation
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StaffAllocationForm;
