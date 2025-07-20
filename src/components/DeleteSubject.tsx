import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface DeleteSubjectProps {
  subject: Tables<"subjects">;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteSubject = ({ subject, onClose, onDelete }: DeleteSubjectProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subject.id);

      if (error) throw error;

      toast.success("Subject deleted successfully!");
      onDelete();
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast.error("Failed to delete subject: " + error.message);
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
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-card/80 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-foreground font-montserrat">Delete Subject</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-200 bg-red-50 mb-6">
                <Trash2 className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Confirm Deletion</AlertTitle>
                <AlertDescription className="text-red-800">
                  Are you sure you want to delete the subject "{subject.name}" ({subject.code})? This action cannot be undone.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 mr-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? "Deleting..." : "Delete Subject"}
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
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteSubject;