"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from 'next/link';


const CreateSideBarItems = ({ item }: any) => {
  if (item.length === 0) return <></>;
  console.log(item)
  if (item.items.length === 0 && item.isActive) {

    return (
      <SidebarMenuSubItem key={item.title}>
        <SidebarMenuSubButton asChild>
          <Link href={item.url}>
            <span className={`${item?.category === 'menu' ? 'font-semibold' : ''}`}>{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  if (item.isActive) {
    return (
      <>
        <Collapsible key={item.title}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <button className="text-sm group flex items-center justify-between w-full px-2 py-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <ChevronRight
                  className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-90"
                />


              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem: { title: any }) => (
                  <CreateSideBarItems key={subItem.title} item={subItem} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>



      </>
    )
  }
}

export function NavMain({
  items, label
}: {
  items: any[],
  label: string
}) {

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>{label}</SidebarGroupLabel> */}
      <SidebarMenu>
        {items?.map((item, index) => (<CreateSideBarItems key={index} item={item} />))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

