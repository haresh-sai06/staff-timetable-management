
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExportTimetableProps {
  department: string;
  semester: string;
  year?: string;
}

const ExportTimetable = ({ department, semester, year }: ExportTimetableProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsExporting(true);
    
    try {
      // Get current user for attribution
      const { data: { user } } = await supabase.auth.getUser();
      let userName = "Unknown User";
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .maybeSingle();
        
        userName = profile?.full_name || user.email?.split("@")[0] || "User";
      }

      // Create PDF document
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Header with SKCT branding
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Sri Krishna College of Technology", pdf.internal.pageSize.width / 2, 25, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Autonomous | Affiliated to Anna University | NIRF Rank 83 (2024)", pdf.internal.pageSize.width / 2, 35, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const title = `${department} Department - ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester Timetable`;
      pdf.text(title, pdf.internal.pageSize.width / 2, 50, { align: "center" });
      
      if (year) {
        pdf.setFontSize(14);
        pdf.text(`Academic Year: ${year}`, pdf.internal.pageSize.width / 2, 60, { align: "center" });
      }

      // Mock timetable data - replace with actual data from your API
      const timeSlots = [
        "08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15", 
        "13:15-14:15", "14:15-15:15", "15:30-16:30", "16:30-17:30"
      ];
      
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Create table data with realistic content
      const tableData = days.map((day, dayIndex) => {
        const rowData = [day];
        timeSlots.forEach((slot, index) => {
          // Mock realistic timetable data
          if (Math.random() > 0.2) { // 80% chance of having a class
            const subjects = ["Data Structures", "Database Systems", "Computer Networks", "Software Engineering", "Machine Learning", "Web Development"];
            const staff = ["Dr. Priya Sharma", "Prof. Rajesh Kumar", "Dr. Anjali Verma", "Prof. Suresh Nair"];
            const rooms = ["CSE-101", "CSE-102", "CSE-Lab1", "CSE-Lab2"];
            
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const staffMember = staff[Math.floor(Math.random() * staff.length)];
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            
            rowData.push(`${subject}\n${staffMember}\n${room}`);
          } else {
            rowData.push(""); // Empty slot
          }
        });
        return rowData;
      });

      // Add table with proper type assertion for jsPDF
      const doc = pdf as any;
      doc.autoTable({
        head: [["Day", ...timeSlots]],
        body: tableData,
        startY: year ? 75 : 65,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        headStyles: {
          fillColor: [30, 58, 138], // Dark blue
          textColor: [255, 215, 0], // Gold
          fontStyle: 'bold',
          fontSize: 9
        },
        columnStyles: {
          0: { 
            fillColor: [30, 58, 138], 
            textColor: [255, 215, 0], 
            fontStyle: 'bold',
            cellWidth: 25
          }
        },
        alternateRowStyles: {
          fillColor: [240, 242, 247]
        },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
        margin: { left: 10, right: 10 }
      });

      // Footer with user attribution
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Downloaded by: ${userName}`, 20, pageHeight - 20);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, pageHeight - 10);
      
      // Add SKCT logo placeholder (you can replace this with actual logo)
      pdf.setFontSize(8);
      pdf.text("SKCT Timetable Management System", pageWidth - 80, pageHeight - 10);

      // Save the PDF
      const fileName = `${department}_${semester}_timetable_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Export Successful",
        description: `Timetable exported as ${fileName}`,
      });

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isExporting}
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
    >
      {isExporting ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
          <span>Exporting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </div>
      )}
    </Button>
  );
};

export default ExportTimetable;
