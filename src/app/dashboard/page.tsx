"use client";

import DashboardLoader from "@/components/ui/DashboardLoader";


export default function Page() {
  const [customLoadingState, setCustomLoadingState] = useState(true);

  return (
    <DashboardLoader loading={customLoadingState}/>
  );
}
