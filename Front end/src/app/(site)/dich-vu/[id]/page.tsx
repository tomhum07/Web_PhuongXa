type Service = {
  serviceId: number;
  name: string;
  description: string;
  procedureDetails?: string;
  isActive: boolean;
};

type ServiceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    name?: string;
  }>;
};

export default async function Page({
  params,
  searchParams,
}: ServiceDetailPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  let serviceName = query?.name;

  if (!serviceName) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/Services`, {
        next: { revalidate: 300 },
      });

      if (response.ok) {
        const services: Service[] = await response.json();
        const matchedService = services.find(
          (service) => service.serviceId.toString() === id,
        );
        serviceName = matchedService?.name;
      }
    } catch {
      // Keep fallback text if API is unavailable.
    }
  }

  return (
    <div>
      <div className="my-6 text-center">
        <h1 className="text-3xl font-bold">{serviceName ?? `Dịch vụ ${id}`}</h1>
      </div>
    </div>
  );
}
