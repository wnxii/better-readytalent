import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { SkeletonLoader } from "@/components/JobList/SkeletonLoader";
import { useState, useEffect } from "react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import {
  JobListing,
  ApplicantDetail,
  fetchJobDetail,
  fetchApplicantsForJob,
} from "@/services/ReadyTalentAPI";

export function JobDialog({
  jobListing,
  apiToken,
  studentId,
}: {
  jobListing: JobListing;
  apiToken: string;
  studentId: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          View Details
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="[&>button]:hidden max-w-fit">
        <div className="flex justify-center">
          <JobDetailCard
            jobListing={jobListing}
            apiToken={apiToken}
            studentId={studentId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JobDetailCard({
  jobListing: initialJobListing,
  apiToken,
  studentId,
}: {
  jobListing: JobListing;
  apiToken: string;
  studentId: string;
}) {
  const [jobListing, setJobListing] = useState(initialJobListing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch both job details and applicants in parallel
        const [details, applicants] = await Promise.all([
          fetchJobDetail(apiToken, jobListing.jobId, studentId),
          fetchApplicantsForJob(apiToken, jobListing.jobId),
        ]);

        setJobListing((prev) => ({
          ...prev,
          jobDetail: details,
          applicants: applicants,
        }));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to fetch job data: " + error,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobListing.jobId, apiToken, studentId]);

  return (
    <ScrollArea>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={jobListing.companyImageUrl}
                alt={jobListing.companyName}
              />
              <AvatarFallback>
                {jobListing.companyName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{jobListing.jobName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {jobListing.companyName}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="applicants">
                Applicants (
                {jobListing.applicants && jobListing.applicants.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <JobDetailsTab jobListing={jobListing} />
              )}
            </TabsContent>
            <TabsContent value="applicants">
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <ApplicantsTab applicants={jobListing.applicants} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}

function JobDetailsTab({ jobListing }: { jobListing: JobListing }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Vacancy: {jobListing.numOfVacancies}</Badge>
        <Badge variant="secondary">{jobListing.jobDetail.employmentType}</Badge>
        {jobListing.resumeRequired && <Badge>Require Resume</Badge>}
        {jobListing.jobDetail.transcriptRequired && (
          <Badge variant="secondary">Require Transcript</Badge>
        )}
        {jobListing.jobDetail.coverLetterRequired && (
          <Badge variant="secondary">Require Cover Letter</Badge>
        )}
        {jobListing.jobDetail.otherDocumentsRequired && (
          <Badge variant="secondary">Require Other Documents</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="border rounded-lg mb-2 font-semibold p-1">
            Job Description
          </h3>
          <ScrollArea className="h-36 p-1">
            <p className="text-sm">{jobListing.jobDetail.jobDescription}</p>
          </ScrollArea>
        </div>
        <div>
          <h3 className="border rounded-lg mb-2 font-semibold p-1">
            Requirements
          </h3>
          <ScrollArea className="h-36 p-1">
            <p className="text-sm">{jobListing.jobDetail.jobRequirements}</p>
          </ScrollArea>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Company Details</h3>
          <p className="text-sm">{jobListing.jobDetail.companyProfile}</p>
          <a
            href={jobListing.jobDetail.companyWebsite}
            className="text-sm text-blue-500 hover:underline"
          >
            Company Website
          </a>
        </div>
        <div>
          <h3 className="font-semibold">Location</h3>
          <p className="text-sm">{jobListing.jobDetail.companyAddress}</p>
          <div className="mt-2 h-40 w-full relative">
            <img
              src="/placeholder.svg"
              alt="Company Location Map"
              className="rounded-md object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Compensation</h3>
          <p className="text-sm">
            {jobListing.jobDetail.remunerationType}:{" "}
            {jobListing.jobDetail.remunerationRate}
            {jobListing.jobDetail.allowance &&
              ` + ${jobListing.jobDetail.allowance} allowance`}
          </p>
          {jobListing.jobDetail.otherBenefits && (
            <p className="text-sm mt-1">
              Other benefits: {jobListing.jobDetail.otherBenefits}
            </p>
          )}
        </div>
        <div>
          <h3 className="font-semibold">Working Hours</h3>
          <p className="text-sm">{jobListing.jobDetail.workingHours}</p>
        </div>
      </div>
      <Separator />

      <div className="bg-muted p-4 rounded-md">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <p>
            Created On: {jobListing.jobDetail.createdOn.toLocaleDateString()}
          </p>
          <p>End Date: {jobListing.jobDetail.endDate.toLocaleDateString()}</p>
          <p>
            Application Deadline:{" "}
            {jobListing.jobDetail.applicationDeadline.toLocaleDateString()}
          </p>
        </div>
      </div>
      {jobListing.jobDetail.supervisorName && (
        <div>
          <h3 className="font-semibold">Contact Information</h3>
          <p className="text-sm">
            Supervisor: {jobListing.jobDetail.supervisorName}
          </p>
          {jobListing.jobDetail.contactEmail && (
            <p className="text-sm">
              Email: {jobListing.jobDetail.contactEmail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicantsTab({ applicants }: { applicants: ApplicantDetail[] }) {
  console.log(applicants);
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {applicants.map((applicant, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{applicant.applicantName}</p>
            </div>
            <Badge variant="outline">
              {applicant.createdDate
                ? new Date(applicant.createdDate).toLocaleDateString()
                : "Unknown date"}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
