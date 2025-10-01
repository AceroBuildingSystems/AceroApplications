// approvalFlow.config.ts

import { BusinessTrip } from "@/models";

export const approvalFlows: any = {
  recruitment: [
    {
      step: 1,
      key: "approvedByFinance",
      role: "Manager",
      department: "Finance",
      status: "Pending",
      name: "Finance Department"
    },
    {
      step: 2,
      key: "approvedByHR",
      role: "Manager",
      department: "HR & Admin",
      status: "Pending",
      name: "HR & Admin Department"
    },
    {
      step: 3,
      key: "approvedByDepartmentHead",
      role: "DepartmentHead",
      status: "Pending",
      name: "Department Head"
    },
    {
      step: 4,
      key: "approvedByCEO",
      role: "CEO",
      status: "Pending",
      name: "CEO"
    }
  ],

  businessTrip: [
    {
      step: 1,
      key: "reportingToManager",
      role: "Manager",
      status: "Pending",
      name: "Reporting To Manager"
    },
    {
      step: 2,
      key: "approvedByHR",
      role: "Manager",
      department: "HR & Admin",
      status: "Pending",
      name: "HR & Admin Department"
    },
    {
      step: 3,
      key: "approvedByDepartmentHead",
      role: "DepartmentHead",
      status: "Pending",
      name: "Department Head"
    },
    {
      step: 4,
      key: "approvedByCEO",
      role: "CEO",
      status: "Pending",
      name: "CEO"
    }
  ],

  leaveRequest: [
    {
      step: 1,
      key: "approvedByManager",
      role: "Manager",
      status: "Pending"
    },
    {
      step: 2,
      key: "approvedByHR",
      role: "HRManager",
      status: "Pending"
    }
  ]
};
