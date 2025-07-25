import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://apialfa.apoint.uz/v1";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({
        token: `refreshed-mock-jwt-token-${Date.now()}`,
      });
    }

    // Real API call
    const response = await fetch(`${API_BASE_URL}/hr/user/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Refresh token API error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
