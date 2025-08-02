import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import SubjectDropdownSelector from "./SubjectDropdownSelector";

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"),
  subjects: z.array(z.string()).optional(),
  maxHours: z.number().min(1).max(40).optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  onSubmit: (data: StaffFormData) => void;
  initialData?: Partial<StaffFormData>;
  onCancel?: () => void;
}

const departments = [
  "Computer Science",
  "Information Technology", 
  "Electronics and Communication",
  "Electrical and Electronics",
  "Mechanical",
  "Civil",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English"
];

const roles = [
  "Professor",
  "Associate Professor", 
  "Assistant Professor",
  "Lecturer",
  "Lab Assistant",
  "Guest Faculty"
];

export const StaffForm: React.FC<StaffFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
}) => {
  const [subjects, setSubjects] = React.useState<string[]>(initialData?.subjects || []);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      department: initialData?.department || "",
      role: initialData?.role || "",
      subjects: subjects,
      maxHours: initialData?.maxHours || 18,
    },
  });

  React.useEffect(() => {
    form.setValue("subjects", subjects);
  }, [subjects, form]);

  const handleSubmit = (data: StaffFormData) => {
    const formDataWithSubjects = { ...data, subjects };
    onSubmit(formDataWithSubjects);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter staff member's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Teaching Hours per Week</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="40" 
                  placeholder="18"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Label>Handling Subjects</Label>
          <SubjectDropdownSelector 
            selectedSubjects={subjects}
            onSubjectsChange={setSubjects}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {initialData ? "Update Staff" : "Add Staff"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default StaffForm;