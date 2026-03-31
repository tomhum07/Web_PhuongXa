import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    // Decode URL in case it was encoded
    const decodedUrl = decodeURIComponent(imageUrl);
    console.log("[Proxy] Attempting to fetch image from:", decodedUrl);

    // Fetch image from backend
    const response = await fetch(decodedUrl, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      console.error(`[Proxy] Backend returned ${response.status} for ${decodedUrl}`);
      return NextResponse.json(
        { error: `Backend image not found: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
    });
  } catch (error) {
    console.error("[Proxy] Error:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

