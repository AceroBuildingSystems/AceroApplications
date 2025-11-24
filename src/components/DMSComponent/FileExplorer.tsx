"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export interface DocumentItem {
    id: string;
    name: string;
    type: "file" | "folder";
    fileData?: File;
    children?: DocumentItem[];
    permissions?: string[]; // <-- add this
    sharedWith?: Array<{
        userId: string;
        permissions: string[];
    }>;
}

interface FileExplorerProps {
    data: DocumentItem[];
    onUpdate?: (updatedData: DocumentItem[]) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ data, onUpdate }) => {
    const [items, setItems] = useState<DocumentItem[]>(data);
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
    const [selectedFolderOrFile, setSelectedFolderOrFile] = useState<string | null>(null);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"folder" | "file">("folder");
    const [inputValue, setInputValue] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Share dialog
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareUser, setShareUser] = useState("");
    const [permissions, setPermissions] = useState({ view: true, edit: false, delete: false });

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    const [editPermDialogOpen, setEditPermDialogOpen] = useState(false);
    const [editPermissions, setEditPermissions] = useState({ view: true, edit: false, delete: false });
    const [itemToEditPerm, setItemToEditPerm] = useState<DocumentItem | null>(null);


    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<DocumentItem | null>(null);
    const [editName, setEditName] = useState("");


    const openEditItem = (id: string) => {
        const item = findItemById(items, id);
        if (!item) return;

        setItemToEdit(item);
        setEditName(item.name);
        setEditDialogOpen(true);
    };



    const handleUpdateItemName = () => {
        if (!itemToEdit) return;

        const updateTree = (nodes: DocumentItem[]): DocumentItem[] =>
            nodes.map((node) => {
                if (node.id === itemToEdit.id) {
                    return { ...node, name: editName };
                } else if (node.children) {
                    return { ...node, children: updateTree(node.children) };
                }
                return node;
            });

        const updatedItems = updateTree(items);
        setItems(updatedItems);
        onUpdate?.(updatedItems);
        setEditDialogOpen(false);
        setItemToEdit(null);
        toast.success(`${itemToEdit.type === "file" ? "File" : "Folder"} renamed successfully`);
    };

    const handleDeleteItem = (item: DocumentItem) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        const deleteFromTree = (nodes: DocumentItem[]): DocumentItem[] =>
            nodes
                .filter((node) => node.id !== item.id)
                .map((node) => (node.children ? { ...node, children: deleteFromTree(node.children) } : node));

        const updatedItems = deleteFromTree(items);
        setItems(updatedItems);
        onUpdate?.(updatedItems);
        toast.success(`${item.type === "file" ? "File" : "Folder"} deleted successfully`);
    };



    const openEditPermissions = (item: DocumentItem) => {
        setItemToEditPerm(item);
        setEditPermissions({
            view: item.permissions?.includes("view") || false,
            edit: item.permissions?.includes("edit") || false,
            delete: item.permissions?.includes("delete") || false,
        });
        setEditPermDialogOpen(true);
    };

    const handleUpdatePermissions = () => {
        if (!itemToEditPerm) return;

        const updateTree = (nodes: DocumentItem[]): DocumentItem[] =>
            nodes.map((node) => {
                if (node.id === itemToEditPerm.id) {
                    return { ...node, permissions: Object.keys(editPermissions).filter(p => editPermissions[p as keyof typeof editPermissions]) };
                } else if (node.children) {
                    return { ...node, children: updateTree(node.children) };
                }
                return node;
            });

        const updatedItems = updateTree(items);
        setItems(updatedItems);
        onUpdate?.(updatedItems);
        setEditPermDialogOpen(false);
        alert("Permissions updated successfully!");
    };


    const toggleFolder = (id: string) => {
        setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreateClick = (type: "folder" | "file") => {
        setDialogType(type);
        setInputValue("");
        setSelectedFile(null);
        setDialogOpen(true);
    };

    // Determine if Add buttons should be disabled


    const addItem = (parentId: string | null, type: "file" | "folder", name: string, fileData?: File) => {
        const newItem: DocumentItem = {
            id: Date.now().toString(),
            name,
            type,
            fileData,
            children: type === "folder" ? [] : undefined,
        };

        if (!parentId) {
            const updated = [...items, newItem];
            setItems(updated);
            onUpdate?.(updated);
            return;
        }

        const addToTree = (nodes: DocumentItem[]): DocumentItem[] =>
            nodes.map((node) => {
                if (node.id === parentId && node.type === "folder") {
                    return { ...node, children: [...(node.children || []), newItem] };
                } else if (node.children) {
                    return { ...node, children: addToTree(node.children) };
                }
                return node;
            });

        const updated = addToTree(items);
        setItems(updated);
        onUpdate?.(updated);
    };

    const handleSubmit = () => {
        if (dialogType === "folder") {
            if (!inputValue.trim()) return;
            addItem(selectedFolderOrFile, "folder", inputValue.trim());
            setDialogOpen(false);
            alert("Folder added successfully!"); // <-- Toast message
        } else {
            if (!selectedFile) return;
            addItem(selectedFolderOrFile, "file", selectedFile.name, selectedFile);
            setDialogOpen(false);
            alert("File added successfully!"); // <-- Toast message
        }

        setSelectedFile(null);
        setInputValue("");
    };


    // Share dialog functions
    const openShareDialog = () => {
        if (!selectedFolderOrFile) {
            alert("Please select a folder or file first!");
            return;
        }
        setShareUser("");
        setPermissions({ view: true, edit: false, delete: false });
        setShareDialogOpen(true);
    };

    const handleShare = () => {
        if (!selectedFolderOrFile || !shareUser) return;

        const updateTree = (nodes: DocumentItem[]): DocumentItem[] =>
            nodes.map((node) => {
                if (node.id === selectedFolderOrFile) {
                    const sharedWith = node.sharedWith ? [...node.sharedWith] : [];
                    sharedWith.push({
                        userId: shareUser,
                        permissions: Object.keys(permissions).filter((p) => permissions[p as keyof typeof permissions]),
                    });
                    return { ...node, sharedWith };
                } else if (node.children) {
                    return { ...node, children: updateTree(node.children) };
                }
                return node;
            });

        const updatedItems = updateTree(items);
        setItems(updatedItems);
        onUpdate?.(updatedItems);
        setShareDialogOpen(false);
        alert("Shared successfully!"); // toast message can replace alert
    };

    const filterItems = (nodes: DocumentItem[], query: string): DocumentItem[] => {
        let result: DocumentItem[] = [];
        const searchRecursive = (nodes: DocumentItem[]) => {
            nodes.forEach((node) => {
                if (node.type === "folder") {
                    if (node.name.toLowerCase().includes(query.toLowerCase())) {
                        result.push(node);
                    } else if (node.children) {
                        searchRecursive(node.children);
                    }
                } else if (node.name.toLowerCase().includes(query.toLowerCase())) {
                    result.push(node);
                }
            });
        };
        searchRecursive(nodes);
        return result;
    };

    // Recursive function to find item by ID anywhere in the tree
    const findItemById = (nodes: DocumentItem[], id: string): DocumentItem | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findItemById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedItem = selectedFolderOrFile ? findItemById(items, selectedFolderOrFile) : null;
    const disableAdd = selectedItem?.type === "file";

    const renderTree = (nodes: DocumentItem[]) => (
        <ul className="pl-4 space-y-1">
            {nodes.map((item) => (
                <li key={item.id}>
                    {item.type === "folder" ? (
                        <div className="inline-flex flex-col">
                            <div
                                onClick={() => setSelectedFolderOrFile(item.id)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-blue-50",
                                    selectedFolderOrFile === item.id && "bg-blue-100 border border-blue-300"
                                )}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFolder(item.id);
                                    }}
                                    className="text-blue-700 font-semibold"
                                >
                                    {openFolders[item.id] ? "📂" : "📁"}
                                </button>
                                <span>{item.name}</span>
                            </div>

                            {openFolders[item.id] && item.children && (
                                <div className="ml-6 border-l pl-3 border-gray-300">{renderTree(item.children)}</div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => setSelectedFolderOrFile(item.id)}
                            className={cn(
                                "inline-flex items-center gap-2 ml-8 text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md",
                                selectedFolderOrFile === item.id && "bg-gray-200 border border-gray-300"
                            )}
                        >
                            <span>📄</span>
                            <span>{item.name}</span>
                            {item.permissions && item.permissions.length > 0 && (
                                <div className="flex gap-1 ml-2">
                                    {item.permissions.includes("view") && (
                                        <button
                                            className="text-xs text-blue-600 underline px-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePermissionAction(item, "view");
                                            }}
                                        >
                                            View
                                        </button>
                                    )}
                                    {item.permissions.includes("edit") && (
                                        <button
                                            className="text-xs text-green-600 underline px-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePermissionAction(item, "edit");
                                            }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {item.permissions.includes("delete") && (
                                        <button
                                            className="text-xs text-red-600 underline px-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePermissionAction(item, "delete");
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    const handlePermissionAction = (item: DocumentItem, permission: string) => {
        switch (permission) {
            case "view":
                if (item.fileData) window.open(URL.createObjectURL(item.fileData), "_blank", "noopener,noreferrer");
                break;
            case "edit":
                openEditItem(item);
                break;
            case "delete":
                handleDeleteItem(item);
                break;
            default:
                break;
        }
    };



    return (
        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold"></h2>
                <div className="space-x-2 flex flex-wrap items-center">
                    <Button onClick={() => handleCreateClick("folder")} disabled={disableAdd}>
                        + Folder
                    </Button>
                    <Button onClick={() => handleCreateClick("file")} variant="outline" disabled={disableAdd}>
                        + File
                    </Button>
                    <Button onClick={openShareDialog} variant="secondary" disabled={!selectedFolderOrFile}>
                        Share
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            if (selectedItem) openEditPermissions(selectedItem);
                        }}
                        disabled={!selectedItem}
                    >
                        Permissions
                    </Button>

                </div>

            </div>

            {/* Search */}
            <div className="w-60 mb-4" >
                <Input
                    placeholder="Search files or folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className=""
                />
            </div>


            {/* Tree */}
            <div className="max-h-[500px] overflow-y-auto">
                {renderTree(searchQuery ? filterItems(items, searchQuery) : items)}
            </div>

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{dialogType === "folder" ? "Create New Folder" : "Upload File"}</DialogTitle>
                    </DialogHeader>

                    {dialogType === "folder" ? (
                        <Input
                            placeholder="Enter folder name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    ) : (
                        <div className="space-y-2">
                            <Input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            {selectedFile && (
                                <p className="text-sm text-gray-600">
                                    Selected: <b>{selectedFile.name}</b>
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button onClick={() => setDialogOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>{dialogType === "folder" ? "Create" : "Upload"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Share "{selectedFolderOrFile ? findItemById(items, selectedFolderOrFile)?.name : ''}"
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <Input
                            placeholder="Enter user ID to share with"
                            value={shareUser}
                            onChange={(e) => setShareUser(e.target.value)}
                        />

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={permissions.view}
                                    onChange={(e) => setPermissions({ ...permissions, view: e.target.checked })}
                                />
                                View
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={permissions.edit}
                                    onChange={(e) => setPermissions({ ...permissions, edit: e.target.checked })}
                                />
                                Edit
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={permissions.delete}
                                    onChange={(e) => setPermissions({ ...permissions, delete: e.target.checked })}
                                />
                                Delete
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button onClick={() => setShareDialogOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleShare}>Share</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editPermDialogOpen} onOpenChange={setEditPermDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Permissions for "{itemToEditPerm?.name}"</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={editPermissions.view} onChange={e => setEditPermissions({ ...editPermissions, view: e.target.checked })} />
                            View
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={editPermissions.edit} onChange={e => setEditPermissions({ ...editPermissions, edit: e.target.checked })} />
                            Edit
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={editPermissions.delete} onChange={e => setEditPermissions({ ...editPermissions, delete: e.target.checked })} />
                            Delete
                        </label>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setEditPermDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdatePermissions}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default FileExplorer;
