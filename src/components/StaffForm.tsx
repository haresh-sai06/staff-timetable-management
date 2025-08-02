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
  const [newSubject, setNewSubject] = React.useState("");

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      department: initialData?.department || "",
      role: initialData?.role || "",
      subjects: initialData?.subjects || [],
      maxHours: initialData?.maxHours || 18,
    },
  });

  const subjects = form.watch("subjects") || [];

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      form.setValue("subjects", [...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    form.setValue("subjects", subjects.filter(s => s !== subjectToRemove));
  };

  const handleSubmit = (data: StaffFormData) => {
    onSubmit(data);
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
          <Label>Subjects</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add subject code/name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubject();
                }
              }}
            />
            <Button type="button" onClick={addSubject} variant="outline">
              Add
            </Button>
          </div>
          
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                  {subject}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSubject(subject)}
                  />
                </Badge>
              ))}
            </div>
          )}
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