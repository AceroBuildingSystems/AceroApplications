"use client";

import AuthComponent from "@/components/AuthComponent/AuthComponent";
import { AppSidebar } from "@/components/landingSideBar/app-sidebar";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export default function Page() {
  const [customLoadingState, setCustomLoadingState] = useState(false);
  const session = useSession();

  return (
    <AuthComponent loadingState={customLoadingState}> 
      <SidebarProvider>
        <AppSidebar  />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div> */}
        <div className="flex flex-1">
          <div className="p-2 md:p-10 rounded-tl-2xl dark:border-neutral-700 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
            <div className="flex gap-2">
              {[...new Array(4)].map((i) => (
                <div
                  key={"first" + i}
                  className="h-20 w-full rounded-lg  bg-neutral-300 dark:bg-neutral-800 animate-pulse"
                ></div>
              ))}
            </div>
            <div className="flex gap-2 flex-1">
              {[...new Array(2)].map((i) => (
                <div
                  key={"second" + i}
                  className="h-full w-full rounded-lg  bg-neutral-300 dark:bg-neutral-800 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
      </SidebarProvider>
    </AuthComponent>
  );
}
