import { DataTable } from "../../../components/data-table";
import data from "../data.json";

export default function ServicePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Quản lý dịch vụ</h1>
      <DataTable data={data} />
    </div>
  );
}
