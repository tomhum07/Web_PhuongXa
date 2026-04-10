import { API_PREFIX } from "@/lib/api/config";

export type ProcedureField = {
  serviceCategoryId: number;
  categoryCode: string;
  fieldName: string;
  description: string | null;
  procedureCount: number;
  createdAt: string | null;
};

export type ProcedureByField = {
  serviceId: number;
  serviceCategoryId: number;
  categoryName: string | null;
  serviceCode: string;
  procedureName: string;
  description: string | null;
  procedureFileUrl: string | null;
  templateFileUrl: string | null;
  createdAt: string | null;
};

export type TrackedApplication = {
  applicationId: number;
  serviceId: number;
  applicationCode: string;
  applicantName: string;
  identityNumber: string;
  dateOfBirth: string | null;
  address: string;
  attachedFileUrl: string | null;
  status: string;
  statusText: string;
  handlerId: number | null;
  createdAt: string | null;
  serviceName: string | null;
  categoryName: string | null;
};

// export async function getProceduresFields(): Promise<ProcedureByField[]> {}

export async function getProcedureFields(): Promise<ProcedureField[]> {
  const endpoint = `${API_PREFIX}/public/applications/fields`;

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Không thể tải danh sách lĩnh vực: ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    serviceCategoryId?: number;
    categoryCode?: string;
    fieldName?: string;
    description?: string | null;
    procedureCount?: number;
    createdAt?: string | null;
  }>;

  return data
    .filter(
      (item) =>
        Number.isFinite(item.serviceCategoryId) &&
        typeof item.fieldName === "string" &&
        item.fieldName.trim().length > 0,
    )
    .map((item) => ({
      serviceCategoryId: item.serviceCategoryId as number,
      categoryCode: item.categoryCode ?? "",
      fieldName: item.fieldName as string,
      description: item.description ?? null,
      procedureCount: item.procedureCount ?? 0,
      createdAt: item.createdAt ?? null,
    }));
}

export async function getProceduresByField(
  fieldId: number,
): Promise<ProcedureByField[]> {
  const endpoint = `${API_PREFIX}/public/applications/fields/${fieldId}/procedures`;

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Không thể tải danh sách thủ tục: ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    serviceId?: number;
    serviceCategoryId?: number;
    categoryName?: string | null;
    serviceCode?: string;
    procedureName?: string;
    description?: string | null;
    procedureFileUrl?: string | null;
    templateFileUrl?: string | null;
    createdAt?: string | null;
  }>;

  return data
    .filter(
      (item) =>
        Number.isFinite(item.serviceId) &&
        Number.isFinite(item.serviceCategoryId) &&
        typeof item.procedureName === "string" &&
        item.procedureName.trim().length > 0,
    )
    .map((item) => ({
      serviceId: item.serviceId as number,
      serviceCategoryId: item.serviceCategoryId as number,
      categoryName: item.categoryName ?? null,
      serviceCode: item.serviceCode ?? "",
      procedureName: item.procedureName as string,
      description: item.description ?? null,
      procedureFileUrl: item.procedureFileUrl ?? null,
      templateFileUrl: item.templateFileUrl ?? null,
      createdAt: item.createdAt ?? null,
    }));
}

export async function trackPublicApplication(
  applicationCode: string,
): Promise<TrackedApplication | null> {
  const normalizedCode = applicationCode.trim();

  if (!normalizedCode) {
    throw new Error("Vui lòng nhập mã hồ sơ để tra cứu.");
  }

  const endpoint = `${API_PREFIX}/public/applications/track?applicationCode=${encodeURIComponent(normalizedCode)}`;

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData &&
      typeof errorData === "object" &&
      "Message" in errorData &&
      typeof errorData.Message === "string"
        ? errorData.Message
        : `Không thể tra cứu hồ sơ: ${response.status}`;

    throw new Error(message);
  }

  const data = (await response.json()) as {
    ApplicationId?: number;
    ServiceId?: number;
    ApplicationCode?: string;
    ApplicantName?: string;
    IdentityNumber?: string;
    DateOfBirth?: string | null;
    Address?: string;
    AttachedFileUrl?: string | null;
    Status?: string;
    StatusText?: string;
    HandlerId?: number | null;
    CreatedAt?: string | null;
    ServiceName?: string | null;
    CategoryName?: string | null;
    applicationId?: number;
    serviceId?: number;
    applicationCode?: string;
    applicantName?: string;
    identityNumber?: string;
    dateOfBirth?: string | null;
    address?: string;
    attachedFileUrl?: string | null;
    status?: string;
    statusText?: string;
    handlerId?: number | null;
    createdAt?: string | null;
    serviceName?: string | null;
    categoryName?: string | null;
  };

  const trackedApplication: TrackedApplication = {
    applicationId: data.ApplicationId ?? data.applicationId ?? 0,
    serviceId: data.ServiceId ?? data.serviceId ?? 0,
    applicationCode:
      data.ApplicationCode ?? data.applicationCode ?? normalizedCode,
    applicantName: data.ApplicantName ?? data.applicantName ?? "",
    identityNumber: data.IdentityNumber ?? data.identityNumber ?? "",
    dateOfBirth: data.DateOfBirth ?? data.dateOfBirth ?? null,
    address: data.Address ?? data.address ?? "",
    attachedFileUrl: data.AttachedFileUrl ?? data.attachedFileUrl ?? null,
    status: data.Status ?? data.status ?? "",
    statusText: data.StatusText ?? data.statusText ?? "Chưa xác định",
    handlerId: data.HandlerId ?? data.handlerId ?? null,
    createdAt: data.CreatedAt ?? data.createdAt ?? null,
    serviceName: data.ServiceName ?? data.serviceName ?? null,
    categoryName: data.CategoryName ?? data.categoryName ?? null,
  };

  return trackedApplication;
}

export async function submitPublicApplication(formData: FormData): Promise<{
  applicationCode: string;
  applicationId: number;
  message: string;
}> {
  const endpoints = [`${API_PREFIX}/public/applications/submit`];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const responseData = (await response.json()) as {
          Message?: string;
          ApplicationCode?: string;
          ApplicationId?: number;
          message?: string;
          applicationCode?: string;
          applicationId?: number;
        };
        return {
          applicationCode:
            responseData.ApplicationCode ?? responseData.applicationCode ?? "",
          applicationId:
            responseData.ApplicationId ?? responseData.applicationId ?? 0,
          message:
            responseData.Message ??
            responseData.message ??
            "Nộp hồ sơ thành công!",
        };
      }

      if (response.status === 405) {
        throw new Error(
          "Backend chưa hỗ trợ phương thức POST cho PublicApplications.",
        );
      }

      if (response.status !== 404) {
        const errorData = await response.json().catch(() => null);

        if (
          response.status === 400 &&
          errorData &&
          typeof errorData === "object" &&
          "errors" in errorData &&
          errorData.errors &&
          typeof errorData.errors === "object"
        ) {
          const errors = errorData.errors as Record<string, string[] | string>;
          const details = Object.entries(errors)
            .map(([key, value]) => {
              const message = Array.isArray(value) ? value[0] : value;
              return `${key}: ${message}`;
            })
            .join(" | ");

          throw new Error(
            details ||
              `Dữ liệu hồ sơ chưa đúng định dạng backend yêu cầu (${endpoint}).`,
          );
        }

        const message =
          errorData &&
          typeof errorData === "object" &&
          "Message" in errorData &&
          typeof errorData.Message === "string"
            ? errorData.Message
            : errorData &&
                typeof errorData === "object" &&
                "title" in errorData &&
                typeof errorData.title === "string"
              ? errorData.title
              : `Không thể nộp hồ sơ: ${response.status} (${endpoint})`;

        throw new Error(message);
      }
    } catch (error) {
      if (error instanceof Error) {
        lastError = error;
      }
      continue;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Hệ thống chưa hỗ trợ endpoint nộp hồ sơ công khai.");
}
