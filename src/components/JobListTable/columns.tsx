import { ColumnDef } from "@tanstack/react-table";
import { JobListing } from "@/services/ReadyTalentAPI";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { DataTableColumnHeader } from "@/components/JobListTable/data-table-column-header";
import { JobDialog } from "@/components/JobListTable/JobDialog";

type TableMeta = {
  apiToken: string;
  studentId: string;
};

export const jobListingColumns: ColumnDef<JobListing>[] = [
  {
    accessorKey: "jobPostingId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
  },
  {
    accessorKey: "jobType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.getValue("companyName")}</Badge>;
    },
  },
  {
    accessorKey: "jobName",
    header: () => (
      <Button variant="ghost" size="sm">
        Role
      </Button>
    ),
  },
  {
    accessorKey: "numOfVacancies",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vacancy" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("numOfVacancies")}</div>
      );
    },
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdDate"));
      // Get user's locale from browser
      const userLocale = navigator.language || "en-SG";
      const formattedDate = new Intl.DateTimeFormat(userLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

      return (
        <div className="border rounded-xl p-1 text-center">{formattedDate}</div>
      );
    },
  },
  {
    accessorKey: "applicationDeadline",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("applicationDeadline"));
      // Get user's locale from browser
      const userLocale = navigator.language || "en-SG";
      const formattedDate = new Intl.DateTimeFormat(userLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

      return (
        <div className="border rounded-xl p-1 text-center">{formattedDate}</div>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <Button variant="ghost" size="sm">
        Action
      </Button>
    ),
    cell: ({ row, table }) => {
      const jobListing = row.original;
      const { apiToken, studentId } = table.options.meta as TableMeta;

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(jobListing, null, 2)
                  )
                }
              >
                Copy Listing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Open in ReadyTalent</DropdownMenuItem>
              <JobDialog
                jobListing={jobListing}
                apiToken={apiToken}
                studentId={studentId}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
