import FileExplorer from "@/components/DMSComponent/FileExplorer";
import { documents } from "@/shared/constants";

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">📁 DMS - Document Management System</h1>
      <FileExplorer data={documents} />
    </main>
  );
}
