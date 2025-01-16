import mongoose from 'mongoose';
import { MenuItemicons } from '../iconMaps';
import { MenuItem } from '../types';

export const createMongooseObjectId = (id: any) => {
    if (mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id.toString()) {
        return id;
    }
    return new mongoose.Types.ObjectId(id);
}

export const createSidebarMenuData = (data: any) => {
    if (!data) {
        return {
            user: {},
            navMain: [],
        };
    }

    const user = {
        name: data.shortName,
        email: data.email,
        avatar: data.imageUrl || "",
    };

    const { access } = data || [];

    // Filter access items with `isMenuItem` true
    const menuItems = access
        .filter((item: any) => item.accessId.isMenuItem && item.accessId.isActive)
        .map((item: any) => ({
            id: item.accessId._id.toString(),
            name: item.accessId.name,
            url: item.accessId.url,
            category: item.accessId.category,
            parentId: item.accessId.parentId ? item.accessId.parentId.toString() : null,
            hasAccess: item.hasAccess,
        }));

    // Helper to build nested structure
    const buildMenuTree = (items: any[], parentId: string | null = null):MenuItem[] => {
        return items
            .filter(item => item.parentId === parentId && item.hasAccess) // Stop if hasAccess is false
            .map(item => ({
                title: item.name,
                url: item.url,
                icon: MenuItemicons[item.category],
                items: buildMenuTree(items, item.id), // Recursively add children
            }));
    };

    const navMain = buildMenuTree(menuItems);

    return {
        user,
        navMain,
    };
};

export const isObjectEmpty = (obj:any) => {
    return Object.keys(obj).length === 0;
};



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