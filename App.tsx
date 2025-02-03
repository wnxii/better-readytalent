import { useState, useEffect } from "react";
import {
  fetchAllJobListings,
  fetchJobDetail,
  type JobListing,
  type JobDetail,
  type SchoolJobListing,
  type GenericListing,
} from "@/services/ReadyTalentAPI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/JobList/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";
import { jobListingColumns } from "@/components/JobListTable/columns";
import { DataTable } from "@/components/JobListTable/data-table";
import { LoaderCircle, WandSparkles } from "lucide-react";

function App() {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiToken, setApiToken] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const { toast } = useToast();

  const showErrorToast = (title: string, description: string) => {
    toast({
      variant: "destructive",
      title: title,
      description: description,
    });
  };

  const loadJobListings = async () => {
    if (apiToken === "" || studentId === "") {
      showErrorToast(
        "Empty Input",
        "Can't leave API Token or StudentId blank!"
      );
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchAllJobListings(apiToken, studentId);

      const jobsWithDetails = await Promise.all(
        data.map(async (job) => {
          const details = await fetchJobDetail(apiToken, job.jobId, studentId);
          return {
            ...job,
            jobDetail: details,
          };
        })
      );

      setJobListings(jobsWithDetails);
    } catch (error) {
      console.error("Error fetching job listings:", error);
      showErrorToast(
        "Error",
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex mb-4 gap-4 p-4 border rounded-lg">
        <div className="flex-1">
          <Label htmlFor="apiToken_input">API Token</Label>
          <Input
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            id="apiToken_input"
          ></Input>
        </div>
        <div className="flex-1">
          <Label htmlFor="studentId_input">StudentID</Label>
          <Input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            id="studentId_input"
          ></Input>
        </div>
        <div className="flex-initial self-end">
          <Button onClick={loadJobListings} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles />
            )}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <DataTable
          columns={jobListingColumns}
          data={jobListings}
          apiToken={apiToken}
          studentId={studentId}
        />
      </div>
    </div>
  );
}

export default App;
