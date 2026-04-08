import { ArticleRequest, Category } from "@/types";
import { API_PREFIX } from "@/lib/api/config";

function toRelativeAssetPath(urlOrPath?: string): string {
  if (!urlOrPath) {
    return "";
  }

  if (/^https?:\/\//i.test(urlOrPath)) {
    try {
      return new URL(urlOrPath).pathname;
    } catch {
      return urlOrPath;
    }
  }

  return urlOrPath;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_PREFIX}/admin/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAdminArticles() {
  try {
    const response = await fetch(`${API_PREFIX}/Article`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getPublicArticles() {
  try {
    const response = await fetch(`${API_PREFIX}/PublicArticle`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getArticlesByAuthor(authorId: number) {
  try {
    const response = await fetch(`${API_PREFIX}/Article/author/${authorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch articles by author ${authorId}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching articles by author:", error);
    return [];
  }
}

export async function getLatestArticles() {
  try {
    const response = await fetch(`${API_PREFIX}/PublicArticle/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch latest articles: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    return [];
  }
}

export async function getArticleById(id: number) {
  try {
    const response = await fetch(`${API_PREFIX}/Article/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function createArticle(article: ArticleRequest) {
  try {
    const response = await fetch(`${API_PREFIX}/Article`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(article),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create article: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
}

export async function updateArticle(id: number, article: ArticleRequest) {
  try {
    const response = await fetch(`${API_PREFIX}/Article/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(article),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update article: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
}

export async function deleteArticle(id: number) {
  try {
    const response = await fetch(`${API_PREFIX}/Article/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to delete article: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
}

export async function uploadArticleThumbnail(
  file: File,
  uploaderId: number,
  title?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", "article-thumbnail");
  formData.append("uploaderId", String(uploaderId));
  if (title?.trim()) {
    formData.append("title", title.trim());
  }

  const response = await fetch(`${API_PREFIX}/admin/gallery/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Failed to upload thumbnail: ${response.statusText}`,
    );
  }

  const thumbnailUrl =
    data?.Image?.RelativeUrl ||
    data?.image?.relativeUrl ||
    data?.Image?.StaticUrl ||
    data?.Image?.ImageUrl ||
    data?.image?.staticUrl ||
    data?.image?.imageUrl;

  if (!thumbnailUrl) {
    throw new Error("Upload thành công nhưng không nhận được URL ảnh.");
  }

  const relativeThumbnailUrl = toRelativeAssetPath(thumbnailUrl as string);

  if (!relativeThumbnailUrl) {
    throw new Error("Upload thành công nhưng URL ảnh không hợp lệ.");
  }

  return relativeThumbnailUrl;
}
