import { ContentUploadForm } from "../../../components/admin/content-upload-form";
import { DataTable } from "../../../components/data-table";
import data from "../data.json";

export default function ContentPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Quản lý nội dung</h1>
      <ContentUploadForm />
      <DataTable data={data} />
    </div>
  );
}
