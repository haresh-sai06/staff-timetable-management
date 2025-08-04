
import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import IssueForm from "@/components/IssueForm";
import IssueList from "@/components/IssueList";

const Issues = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleIssueSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="font-montserrat font-bold text-3xl text-foreground mb-2">
              Issue Management
            </h1>
            <p className="text-muted-foreground">
              Report issues and track their resolution status
            </p>
          </div>

          {localStorage.getItem("userRole") === "admin" ? (
            <div className="w-full">
              <IssueList refreshTrigger={refreshTrigger} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <IssueForm onIssueSubmitted={handleIssueSubmitted} />
              </div>
              
              <div>
                <IssueList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Issues;
