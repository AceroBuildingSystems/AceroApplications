// approvalFlow.config.ts

export const approvalFlows = {
  recruitment: [
    {
      step: 1,
      key: "approvedByFinance",
      role: "Manager",
      department: "Finance",
      status: "Pending"
    },
    {
      step: 2,
      key: "approvedByHR",
      role: "Manager",
      department: "HR & Admin",
      status: "Pending"
    },
    {
      step: 3,
      key: "approvedByDepartmentHead",
      role: "DepartmentHead",
      status: "Pending"
    },
    {
      step: 4,
      key: "approvedByCEO",
      role: "CEO",
      status: "Pending"
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
