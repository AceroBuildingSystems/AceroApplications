"use client"
import { useEffect, useState } from "react";
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import DashboardLoader from "../ui/DashboardLoader";

interface DataTableProps<T extends { status: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  rowClassMap: Record<string, string>; // Mapping of status to CSS class names
  summary: boolean;
  summaryTotal: any;
  title: string;
}



export function DataTable<T extends { status: string }>({ data, columns, rowClassMap, summary,summaryTotal, title }: DataTableProps<T>) {

  const rowNo = ['10', '20', '30', '40', '50', '100'];

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const handlePageSizeChange = (size: string) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: parseInt(size, 10),
      pageIndex: 0, // Reset to the first page when changing page size
    }));
  };

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

console.log("data",summaryTotal)
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination, // Use pagination state here
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination, // Listen for pagination changes
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <DashboardLoader loading={table?.getRow?.length===0}>
    <div className="w-full relative h-full flex flex-col gap-1">
      <div className="flex items-center justify-between py-1 gap-1">
       
        <div className="flex items-center gap-1">
          <span className="text-sm">Rows per page</span>
          <Select onValueChange={handlePageSizeChange} defaultValue={String(pagination.pageSize)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={String(pagination.pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {rowNo.map((rows) => (
                <SelectItem key={rows} value={rows}>
                  {rows}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-full w-full pb-6">
        <div className="h-auto max-h-[68vh] overflow-y-auto rounded-md border cursor-pointer">
          <Table className="">
            <TableHeader className=" w-full">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {

                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className=" rounded-md">
              {table?.getRowModel()?.rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (

                    <TableRow
                      key={row.id}
                      className={rowClassMap && rowClassMap[row.original?.status]}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const cellValue = cell.getValue();
                        const isNumeric = typeof cellValue === 'number';

                        let displayValue = flexRender(cell.column.columnDef.cell, cell.getContext());

                        if (isNumeric) {
                          // Round the numeric value and convert to string with formatting
                          displayValue = Math.round(cellValue).toLocaleString(); // rounded and formatted
                        }
                        return (
                          <TableCell key={cell.id} >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* Summary Row (placed outside the map) */}
                  {summary && title === 'Quotation Details' && <TableRow className="bg-gray-200 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell >{summaryTotal.totalQuotes}</TableCell>
                    <TableCell >{summaryTotal.totalJobs}</TableCell>
                    <TableCell >{Math.round(summaryTotal.avgQ22Total).toLocaleString()}</TableCell>
                    <TableCell >{Math.round(summaryTotal.totalWeight).toLocaleString()}</TableCell>
                  </TableRow>}
                  {summary && title === 'Quote Status' && <TableRow className="bg-gray-200 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell >{summaryTotal.totalActive}</TableCell>
                    <TableCell >{summaryTotal.totalBudgetary}</TableCell>
                    <TableCell >{summaryTotal.totalCancel}</TableCell>
                    <TableCell >{summaryTotal.totalDecline}</TableCell>
                    <TableCell >{summaryTotal.totalHold}</TableCell>
                    <TableCell >{summaryTotal.totalHotQuote}</TableCell>
                    <TableCell >{summaryTotal.totalJob}</TableCell>
                    <TableCell >{summaryTotal.totalJobShipped}</TableCell>
                    <TableCell >{summaryTotal.totalLost}</TableCell>
                    <TableCell >{summaryTotal.totalTotal}</TableCell>

                  </TableRow>}
                  {summary && title === 'Job Details' && <TableRow className="bg-gray-200 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell >{summaryTotal.totalQ22Value}</TableCell>
                    <TableCell >{summaryTotal.totalWeight}</TableCell>
                    <TableCell >{}</TableCell>
                    <TableCell >{summaryTotal.totalEstPrice}</TableCell>

                  </TableRow>}
                  {summary && title === 'Job Lost Report' && <TableRow className="bg-gray-200 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell >{summaryTotal.totalWeight}</TableCell>
                    <TableCell >{summaryTotal.totalQ22Value}</TableCell>
                    <TableCell >{summaryTotal.totalEstPrice}</TableCell>
                    <TableCell colSpan={5}>{}</TableCell>
                  </TableRow>}
                  {summary && title === '3 Month SF' && <TableRow className="bg-gray-200 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell colSpan={5}></TableCell>
                    <TableCell >{summaryTotal.totalWeight}</TableCell>
                    <TableCell>{}</TableCell>
                  </TableRow>}
                </>
              )

                : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}


            </TableBody>
          </Table>
        </div>
        <div className="flex h-auto items-center justify-end space-x-2 py-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
    </DashboardLoader>
  )
}

// Removed the redefinition of useEffect

