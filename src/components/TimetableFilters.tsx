
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TimetableFiltersProps {
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedSemester: string;
  setSelectedSemester: (value: string) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  departments: Array<{ value: string; label: string }>;
  semesters: Array<{ value: string; label: string }>;
  viewModes: Array<{ value: string; label: string }>;
}

const TimetableFilters = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedSemester,
  setSelectedSemester,
  viewMode,
  setViewMode,
  departments,
  semesters,
  viewModes
}: TimetableFiltersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-lg text-gray-800">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.value} value={sem.value}>
                      {sem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewMode">View Mode</Label>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                  {viewModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>Current Selection:</strong> {departments.find(d => d.value === selectedDepartment)?.label} - {semesters.find(s => s.value === selectedSemester)?.label}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TimetableFilters;
