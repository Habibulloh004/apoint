import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://apialfa.apoint.uz/v1";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (USE_MOCK_DATA) {
      // Mock login for development
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      if (username && password) {
        return NextResponse.json({
          token: `mock-jwt-token-${Date.now()}`,
          user: {
            username,
            id: 1,
            role: "user",
          },
        });
      } else {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    // Real API call
    const response = await fetch(
      `${API_BASE_URL}/hr/user/sign-in?include=token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
