"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useUserAuthorised from "@/hooks/useUserAuthorised";
import { toast } from "react-toastify";
import { ArrowLeft, Download, CheckCircle, XCircle, FileEdit, Loader2, AlertCircle } from "lucide-react";
import DashboardLoader from '@/components/ui/DashboardLoader';
import RequisitionApprovalActions from '@/components/hiring/requisitions/RequisitionApprovalActions';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { PageTitle } from "@/components/ui/page-title";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { Edit } from "lucide-react";

export default function RequisitionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, authenticated } = useUserAuthorised();
  const [requisition, setRequisition] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionRemarks, setActionRemarks] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const requisitionId = unwrappedParams.id;
  
  const fetchRequisition = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hiring/requisitions/${requisitionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requisition: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRequisition(data);
    } catch (error: any) {
      console.error("Error fetching requisition:", error);
      toast.error(error.message || "Failed to load requisition details");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (authenticated && requisitionId) {
      fetchRequisition();
    }
  }, [authenticated, requisitionId]);
  
  // Function to handle opening the action dialog
  const handleOpenActionDialog = (action: string) => {
    setActionType(action);
    setActionRemarks("");
    setIsActionDialogOpen(true);
  };
  
  // Function to process approval or rejection
  const processAction = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/hiring/requisitions/${requisitionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action: actionType, 
          remarks: actionRemarks 
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || "Action completed successfully");
        setIsActionDialogOpen(false);
        fetchRequisition(); // Refresh the data
      } else {
        throw new Error(result.error || "Failed to process action");
      }
    } catch (error: any) {
      console.error("Error processing action:", error);
      toast.error(error.message || "An error occurred while processing your request");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to generate PDF
  const handleGeneratePDF = async () => {
    try {
      window.open(`/api/hiring/requisitions/${requisitionId}/pdf`, '_blank');
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error(error.message || "Failed to generate PDF");
    }
  };
  
  // Status badge colors
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "Draft": "bg-gray-200 text-gray-800",
      "Pending Department Head": "bg-blue-100 text-blue-800",
      "Pending HR Review": "bg-purple-100 text-purple-800",
      "Pending Finance": "bg-yellow-100 text-yellow-800",
      "Pending HR Head": "bg-indigo-100 text-indigo-800",
      "Pending CFO": "bg-orange-100 text-orange-800",
      "Pending CEO": "bg-pink-100 text-pink-800",
      "Approved": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
    };
    
    return statusColors[status] || "bg-gray-200 text-gray-800";
  };
  
  // Function to determine if user can take action
  const canTakeAction = (status: string): { canApprove: boolean, canReject: boolean, actionName: string } => {
    // Add proper null check for user role
    const userRole = user?.role?.name?.toUpperCase() || "";
    
    switch(status) {
      case "Draft": 
        return { 
          canApprove: requisition?.requestedBy?._id === user?._id, 
          canReject: false, 
          actionName: "submit" 
        };
      case "Pending Department Head":
        return { 
          canApprove: userRole === "DEPARTMENT HEAD", 
          canReject: userRole === "DEPARTMENT HEAD", 
          actionName: "approve_department_head" 
        };
      case "Pending HR Review":
        return { 
          canApprove: userRole === "HR ADMIN", 
          canReject: userRole === "HR ADMIN", 
          actionName: "approve_hr_admin" 
        };
      case "Pending Finance":
        return { 
          canApprove: userRole === "FINANCE", 
          canReject: userRole === "FINANCE", 
          actionName: "approve_finance" 
        };
      case "Pending HR Head":
        return { 
          canApprove: userRole === "HR HEAD", 
          canReject: userRole === "HR HEAD", 
          actionName: "approve_hr_head" 
        };
      case "Pending CFO":
        return { 
          canApprove: userRole === "CFO", 
          canReject: userRole === "CFO", 
          actionName: "approve_cfo" 
        };
      case "Pending CEO":
        return { 
          canApprove: userRole === "CEO", 
          canReject: userRole === "CEO", 
          actionName: "approve_ceo" 
        };
      default:
        return { canApprove: false, canReject: false, actionName: "" };
    }
  };
  
  if (!authenticated) {
    return <div>Please login to continue</div>;
  }
  
  if (loading) {
    return <DashboardLoader />;
  }
  
  if (!requisition) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => router.push("/dashboard/hiring/requisitions")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requisitions
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Requisition Not Found</h2>
            <p className="text-gray-500 mb-4">The requisition you're looking for does not exist or has been deleted.</p>
            <Button onClick={() => router.push("/dashboard/hiring/requisitions")}>
              Return to Requisitions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { canApprove, canReject, actionName } = canTakeAction(requisition.status);
  
  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/hiring/requisitions">Requisitions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink>{requisition.requestedPosition}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <PageTitle title={`${requisition.requestedPosition} - ${requisition.department?.name || 'Unknown Department'}`} />
        </div>
        <div className="flex gap-2">
          {requisition.status === 'Draft' && (
            <Link href={`/dashboard/hiring/requisitions/${unwrappedParams.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Requisition
              </Button>
            </Link>
          )}
          <Link href="/dashboard/hiring/requisitions">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Add the Approval Actions component */}
      <RequisitionApprovalActions 
        requisitionId={unwrappedParams.id} 
        status={requisition.status} 
      />
      
      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="approvals">Approval History</TabsTrigger>
          {requisition.status === 'Approved' && (
            <TabsTrigger value="jobPosting">Job Posting</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Position</h3>
              <p className="mt-1 text-lg">{requisition.requestedPosition || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p className="mt-1 text-lg">{requisition.department?.name || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Number of Positions</h3>
              <p className="mt-1 text-lg">{requisition.numberRequired || 1}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Priority</h3>
              <p className="mt-1 text-lg capitalize">{requisition.priority?.toLowerCase() || "Normal"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1 text-lg capitalize">{requisition.employmentType?.toLowerCase() || "Full Time"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Requested By</h3>
              <p className="mt-1 text-lg">
                {requisition.requestedBy?.displayName || 
                  (requisition.requestedBy?.firstName && requisition.requestedBy?.lastName 
                    ? `${requisition.requestedBy.firstName} ${requisition.requestedBy.lastName}`
                    : "N/A")
                }
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date Requested</h3>
              <p className="mt-1 text-lg">
                {requisition.requestDate ? new Date(requisition.requestDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Expected Start Date</h3>
              <p className="mt-1 text-lg">
                {requisition.startDate ? new Date(requisition.startDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Justification</h3>
            <p className="whitespace-pre-line">{requisition.justification || "No justification provided."}</p>
          </div>
          
          {requisition.duties && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Duties & Responsibilities</h3>
                <p className="whitespace-pre-line">{requisition.duties}</p>
              </div>
            </>
          )}
          
          {requisition.qualifications && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Qualifications & Skills</h3>
                <p className="whitespace-pre-line">{requisition.qualifications}</p>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Display built-in approval info for backward compatibility */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Department Head</span>
                    <span>
                      {requisition.departmentHeadApproval?.approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">HR Admin Review</span>
                    <span>
                      {requisition.hrAdminReview?.approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Finance</span>
                    <span>
                      {requisition.financeApproval?.approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">HR Head</span>
                    <span>
                      {requisition.hrHeadApproval?.approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">CFO</span>
                    <span>
                      {requisition.cfoApproval?.approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">CEO</span>
                    <span>
                      {requisition.ceoApproval?.approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {requisition.status === 'Approved' && (
          <TabsContent value="jobPosting">
            {/* Job posting content */}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 