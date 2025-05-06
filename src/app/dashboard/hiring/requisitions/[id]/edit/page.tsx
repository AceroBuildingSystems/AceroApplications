"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import useUserAuthorised from "@/hooks/useUserAuthorised";
import { useGetMasterQuery } from "@/services/endpoints/masterApi";
import DashboardLoader from '@/components/ui/DashboardLoader';

export default function EditRequisitionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, authenticated } = useUserAuthorised();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    requestedPosition: "",
    department: "",
    numberRequired: 1,
    employmentType: "FULL_TIME",
    priority: "NORMAL",
    startDate: "",
    justification: "",
    duties: "",
    qualifications: "",
  });

  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const requisitionId = unwrappedParams.id;

  // Get departments
  const { data: departmentData = [], isLoading: departmentLoading }: any = useGetMasterQuery({
    db: 'DEPARTMENT_MASTER',
    filter: { isActive: true },
    sort: { name: 'asc' },
  });

  // Fetch requisition data
  const fetchRequisition = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hiring/requisitions/${requisitionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requisition: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if the requisition is in draft status
      if (data.status !== "Draft") {
        toast.error("Only draft requisitions can be edited");
        router.push(`/dashboard/hiring/requisitions/${requisitionId}`);
        return;
      }
      
      // Check if the user is the one who created it
      if (data.requestedBy?._id !== user?._id) {
        toast.error("You can only edit requisitions you created");
        router.push(`/dashboard/hiring/requisitions/${requisitionId}`);
        return;
      }
      
      // Format the date for the input field
      const startDate = data.startDate 
        ? new Date(data.startDate).toISOString().split('T')[0]
        : "";
      
      setFormData({
        requestedPosition: data.requestedPosition || "",
        department: data.department?._id || "",
        numberRequired: data.numberRequired || 1,
        employmentType: data.employmentType || "FULL_TIME",
        priority: data.priority || "NORMAL",
        startDate,
        justification: data.justification || "",
        duties: data.duties || "",
        qualifications: data.qualifications || "",
      });
    } catch (error: any) {
      console.error("Error fetching requisition:", error);
      toast.error(error.message || "Failed to load requisition details");
      router.push("/dashboard/hiring/requisitions");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/hiring/requisitions/${requisitionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success("Requisition updated successfully");
        router.push(`/dashboard/hiring/requisitions/${requisitionId}`);
      } else {
        throw new Error(result.error || "Failed to update requisition");
      }
    } catch (error: any) {
      console.error("Error updating requisition:", error);
      toast.error(error.message || "An error occurred while updating the requisition");
    } finally {
      setSaving(false);
    }
  };
  
  useEffect(() => {
    if (authenticated && requisitionId) {
      fetchRequisition();
    }
  }, [authenticated, requisitionId]);
  
  if (!authenticated) {
    return <div>Please login to continue</div>;
  }
  
  if (loading || departmentLoading) {
    return <DashboardLoader />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4"
          onClick={() => router.push(`/dashboard/hiring/requisitions/${requisitionId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Requisition</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of the position required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedPosition">Position Title</Label>
                <Input 
                  id="requestedPosition"
                  name="requestedPosition"
                  value={formData.requestedPosition}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange(value, "department")}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentData?.data?.map((dept: any) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numberRequired">Number of Positions</Label>
                <Input 
                  id="numberRequired"
                  name="numberRequired"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.numberRequired}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={formData.employmentType}
                  onValueChange={(value) => handleSelectChange(value, "employmentType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                    <SelectItem value="INTERN">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange(value, "priority")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Expected Start Date</Label>
                <Input 
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide detailed information about the role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="justification">Justification for Hiring</Label>
              <Textarea 
                id="justification"
                name="justification"
                value={formData.justification}
                onChange={handleInputChange}
                placeholder="Why is this position needed?"
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duties">Duties & Responsibilities</Label>
              <Textarea 
                id="duties"
                name="duties"
                value={formData.duties}
                onChange={handleInputChange}
                placeholder="List the key responsibilities of this role"
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications & Skills</Label>
              <Textarea 
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="Required qualifications, skills, and experience"
                rows={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/hiring/requisitions/${requisitionId}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 