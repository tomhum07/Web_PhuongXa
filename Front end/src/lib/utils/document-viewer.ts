/**
 * Get the URL for viewing documents via Office Online Viewer
 * Converts Word/Excel files for online viewing via Microsoft Office Viewer
 * PDF and images are opened directly in a new tab
 */
export function getDocumentViewerUrl(url: string): string {
  if (!url || url === "#") {
    return "#";
  }

  const lower = url.toLowerCase();

  // Nếu là file Word/Excel thì dùng trình đọc trực tuyến của Microsoft
  if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx")
  ) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }

  // Nếu là PDF hoặc hình ảnh thì giữ nguyên để mở tab mới
  return url;
}
