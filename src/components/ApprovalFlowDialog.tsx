"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { approvalFlows } from "@/configs/approvalFlow.config";
import moment from "moment";

type Approver = {
    displayName: ReactNode;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
};

type ApprovalStep = {
    step: number;
    key: string;
    approverId: Approver;
    date: string | null;
    status: "Approved" | "Rejected" | "Pending";
    remarks: string;
};

interface ApprovalFlowDialogProps {
    isOpen: boolean;
    closeDialog: () => void;
    approvalFlow: ApprovalStep[];
    title?: string;
    name?: string;
}

const ApprovalFlowDialog: FC<ApprovalFlowDialogProps> = ({
    isOpen,
    closeDialog,
    approvalFlow,
    title = "Approval Workflow",
    name = "recruitment"
}) => {
    const getStatusUI = (status: string) => {
        switch (status) {
            case "Approved":
                return (
                    <span className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 size={20} /> Approved
                    </span>
                );
            case "Rejected":
                return (
                    <span className="flex items-center gap-2 text-red-600 font-medium">
                        <XCircle size={20} /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-2 text-yellow-600 font-medium">
                        <Clock size={20} />  Pending
                    </span>
                );
        }
    };

    const getApprovalName = (flowType: keyof typeof approvalFlows, key: string) => {
        const flow = approvalFlows[flowType];
        const step: any = flow.find((s) => s.key === key);
        return step ? step.name : key; // fallback to key if not found
    };
    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent
                className="bg-white max-w-full pointer-events-auto mx-2 max-h-[85vh] w-[50%] h-[85vh] flex flex-col items-center justify-center"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="w-full text-center flex items-center justify-center">
                    <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                </DialogHeader>

                {approvalFlow && approvalFlow?.length > 0 ? (
                    <div className="mt-6 space-y-3 flex flex-col items-center w-full overflow-y-auto pr-1">
                        {approvalFlow?.map((step) => (
                            <div
                                key={step.step}
                                className="flex flex-row justify-center items-center gap-6 w-[70%] "
                            >
                                {/* Info Section */}
                                <div className="flex flex-col items-center text-center w-full">
                                    <p className="font-semibold pb-1">{getApprovalName(name, step?.key)}</p>

                                    <p className="text-sm text-gray-600">
                                        {/* <span className="font-medium">Approver:</span>{" "} */}
                                        {step?.approverId?.displayName}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Date:</span>{" "}
                                        {step?.date ? moment(step?.date).format("DD-MMM-yyyy hh:mm A") : "—"}
                                    </p>

                                    {step.remarks && (
                                        <p className="text-sm text-gray-500 italic">Reason: "{step?.remarks}"</p>
                                    )}

                                    {step.step !== approvalFlow.length && (<div className="mt-2 w-px h-6 bg-gray-300 "></div>)}
                                </div>

                                {/* Status Section */}
                                <div className="flex justify-center items-center text-center w-full">
                                    <p className="text-lg font-semibold">{getStatusUI(step.status)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    <p className="text-gray-500 mt-4 text-center">No approval steps available.</p>
                )}
            </DialogContent>
        </Dialog>

    );
};

export default ApprovalFlowDialog;
