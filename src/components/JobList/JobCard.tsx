import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  // Add other job-related fields as needed
}

export function JobCard({ job }: { job: JobListing }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{job.company}</p>
        <p className="mt-2">{job.description}</p>
      </CardContent>
    </Card>
  )
}