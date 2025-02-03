"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/JobListTable/data-table-view-options";

import { DataTableFacetedFilter } from "@/components/JobListTable/data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search"
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("companyName") && (
          <DataTableFacetedFilter
            column={table.getColumn("companyName")}
            title="Company"
            options={Array.from(
              new Set(
                table
                  .getPreFilteredRowModel()
                  .rows.map((row) => row.getValue("companyName") as string)
              )
            ).map((company) => ({
              label: company,
              value: company,
            }))}
          />
        )}
        {table.getColumn("jobType") && (
          <DataTableFacetedFilter
            column={table.getColumn("jobType")}
            title="Type"
            options={Array.from(
              new Set(
                table
                  .getPreFilteredRowModel()
                  .rows.map((row) => row.getValue("jobType") as string)
              )
            ).map((type) => ({
              label: type,
              value: type,
            }))}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
