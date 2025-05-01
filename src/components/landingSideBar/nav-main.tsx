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

  if (item.items.length === 0) {
    return (
      <SidebarMenuSubItem key={item.title}>
        <SidebarMenuSubButton asChild>
          <Link href={item.url}>
            <span>{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <>
      <Collapsible key={item.title} asChild >
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={item.title}>
            <Link href={item.url}>
              {/* <item.icon /> */}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>

          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="data-[state=open]:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map((subItem: { title: any; }) => (
                <CreateSideBarItems key={subItem.title} item={subItem} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>

    </>
  )

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

