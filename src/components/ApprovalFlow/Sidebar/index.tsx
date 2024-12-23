"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const dummyUsers = [
  { id: 1, name: "John Doe", designation: "Manager" },
  { id: 2, name: "Jane Smith", designation: "Developer" },
  { id: 3, name: "Alice Johnson", designation: "Designer" },
  { id: 4, name: "Bob Williams", designation: "QA Lead" },
];

export default function Sidebar({ onDragStart }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = dummyUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-white shadow-lg h-screen p-4 overflow-y-auto">
      <h2 className="font-bold mb-4">Users</h2>
      <Input
        placeholder="Search by name or designation..."
        className="mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-2 mb-2 border rounded shadow cursor-pointer bg-gray-50"
            draggable
            onDragStart={(event) => onDragStart(event, user)}
          >
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.designation}</p>
          </div>
        ))}
        {filteredUsers.length === 0 && <p>No users found.</p>}
      </div>
    </div>
  );
}