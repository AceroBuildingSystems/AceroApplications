"use client";

import AuthComponent from "@/components/AuthComponent/AuthComponent";
import { AppSidebar } from "@/components/landingSideBar/app-sidebar";
import { Children, useState } from "react";
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
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/landingSideBar/nav-user";
import useUserAuthorised from "@/hooks/useUserAuthorised";


export default function Layout({ children }: { children: React.ReactNode }) {
  const [customLoadingState, setCustomLoadingState] = useState(false);
  const pathName = usePathname();
  const pathContent = pathName.split('/')
  const pageName = pathContent[pathContent.length - 1].split("_");
  const { user, menuItems }: any = useUserAuthorised();
  return (
    <AuthComponent loadingState={customLoadingState}  >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="">
          <div className="flex flex-col w-full h-screen   2xl:max-w-[100%]">
            <header className="flex h-14 shrink-0 items-center gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 px-4 w-full">
                  <SidebarTrigger className="-ml-1" />
                  {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      {/* <BreadcrumbItem className="hidden md:block">
                         <BreadcrumbLink href="#">
                          Acero Application
                        </BreadcrumbLink> 
                      </BreadcrumbItem> */}
                      {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                      <BreadcrumbItem>
                        <BreadcrumbPage className="font-semibold">{pageName[0] && pageName[0].toProperCase()} {pageName[1] && pageName[1].toProperCase()} {pageName[2] && pageName[2].toProperCase()}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                </div>
                <div className="w-full flex items-center justify-end gap-2 py-1">
                  <SidebarFooter>
                    <NavUser user={user} />
                  </SidebarFooter>
                </div>

              </div>

            </header>
            <div className="h-full w-full overflow-auto py-1 border-t-2 shadow-lg border-gray-100">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthComponent>
  );
}
