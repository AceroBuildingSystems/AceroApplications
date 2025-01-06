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


const CreateSideBarItems = ({item}:any)=>{
  if(item.length === 0 ) return <></>;

  if(item.items.length === 0){
    return (
      <SidebarMenuSubItem key={item.title}>
            <SidebarMenuSubButton asChild>
              <a href={item.url}>
                <span>{item.title}</span>
              </a>
            </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <>
    <Collapsible key={item.title} asChild >
      <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title}>
      <a href={item.url}>
        {/* <item.icon /> */}
        <span>{item.title}</span>
      </a>
    </SidebarMenuButton>

    <CollapsibleTrigger asChild>
      <SidebarMenuAction className="data-[state=open]:rotate-90">
        <ChevronRight />
        <span className="sr-only">Toggle</span>
      </SidebarMenuAction>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <SidebarMenuSub>
        {item.items?.map((subItem) => (
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
  items,label
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[],
  label:string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items?.map(({menuItem:item,permissions}, index) => (
          permissions?.view &&
          <CreateSideBarItems key={index} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

