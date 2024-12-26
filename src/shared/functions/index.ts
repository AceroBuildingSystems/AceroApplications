import mongoose from 'mongoose';
import { MenuItemicons } from '../iconMaps';

export const createMongooseObjectId = (id: any) => {
    if (mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id.toString()) {
        return id;
    }
    return new mongoose.Types.ObjectId(id);
}

export const createSidebarMenuData = (data:any)=>{
    if(!data){
        return {
            user:{},
            navMain:{}
        }
    }

    const user = {
        name: data.shortName,
        email: data.email,
        avatar: data.imageUrl || "",
    }

    const navMain:any = []
    const {access} = data || []

    access.forEach((item:any)=>{
        if(item.accessId.isMenuItem && item.accessId.isActive && item.hasAccess){

           let index = navMain.findIndex((nav:any)=>nav.title === item.accessId.category)
           
           if(index === -1){
                navMain.push({
                    title: item.accessId.category,
                    url: "#",
                    icon: MenuItemicons[item.accessId.category],
                    items: []
                });
                index = navMain.length - 1;
           }

           navMain[index].items.push({
                title:item.accessId.name,
                url:item.accessId.url
           })
        }
    })

    return {
        user,
        navMain
    }
}


// {
//     title: "Playground",
//     url: "#",
//     icon: SquareTerminal,
//     isActive: true,
//     items: [
//       {
//         title: "History",
//         url: "#",
//       },
//       {
//         title: "Starred",
//         url: "#",
//       },
//       {
//         title: "Settings",
//         url: "#",
//       },
//     ],
//   },