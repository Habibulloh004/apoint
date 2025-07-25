import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://apialfa.apoint.uz/v1";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const mockMaterialsData = [
  {
    name: "100A 456454-A/1 040/027 10048057",
    material_id: 763,
    color: null,
    code: "10048057",
    last_price: 0,
    min_amount: null,
    category: "Material",
    parent: "Material",
    unit: "metr",
    width: "",
    remind_start_amount: 150,
    remind_start_sum: 15000,
    remind_income_amount: 50,
    remind_income_sum: 5000,
    remind_outgo_amount: 30,
    remind_outgo_sum: 3000,
    remind_end_amount: 170,
    remind_end_sum: 17000,
  },
  {
    name: "100A 456454/2 040/027 10048057",
    material_id: 785,
    color: null,
    code: "10048057",
    last_price: 0,
    min_amount: null,
    category: "Material",
    parent: "Material",
    unit: "metr",
    width: "",
    remind_start_amount: 200,
    remind_start_sum: 20000,
    remind_income_amount: 75,
    remind_income_sum: 7500,
    remind_outgo_amount: 45,
    remind_outgo_sum: 4500,
    remind_end_amount: 230,
    remind_end_sum: 23000,
  },
  {
    name: "Celofan Roll Type A",
    material_id: 800,
    color: null,
    code: "CEL001",
    last_price: 0,
    min_amount: null,
    category: "Celofan",
    parent: "Material",
    unit: "metr",
    width: "",
    remind_start_amount: 300,
    remind_start_sum: 30000,
    remind_income_amount: 100,
    remind_income_sum: 10000,
    remind_outgo_amount: 80,
    remind_outgo_sum: 8000,
    remind_end_amount: 320,
    remind_end_sum: 32000,
  },
  {
    name: "Etiketa Standard",
    material_id: 850,
    color: null,
    code: "ETI001",
    last_price: 0,
    min_amount: null,
    category: "Etiketka",
    parent: "Material",
    unit: "dona",
    width: "",
    remind_start_amount: 500,
    remind_start_sum: 25000,
    remind_income_amount: 200,
    remind_income_sum: 10000,
    remind_outgo_amount: 150,
    remind_outgo_sum: 7500,
    remind_end_amount: 550,
    remind_end_sum: 27500,
  },
  {
    name: "Aksesuar Basic",
    material_id: 900,
    color: null,
    code: "AKS001",
    last_price: 0,
    min_amount: null,
    category: "Aksesuar",
    parent: "Aksesuar",
    unit: "dona",
    width: "",
    remind_start_amount: 100,
    remind_start_sum: 12000,
    remind_income_amount: 50,
    remind_income_sum: 6000,
    remind_outgo_amount: 25,
    remind_outgo_sum: 3000,
    remind_end_amount: 125,
    remind_end_sum: 15000,
  },
  {
    name: "40*42*20 (ryuzgak)",
    material_id: 950,
    color: "dona",
    code: "6700",
    last_price: 6700,
    min_amount: null,
    category: "korobka",
    parent: "IP",
    unit: "dona",
    width: "",
    remind_start_amount: 68,
    remind_start_sum: 455600,
    remind_income_amount: 0,
    remind_income_sum: 0,
    remind_outgo_amount: 0,
    remind_outgo_sum: 0,
    remind_end_amount: 68,
    remind_end_sum: 455600,
  },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }
    if (USE_MOCK_DATA) {
      // Mock API call with delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(mockMaterialsData);
    }
    // Real API call
    const token = authorization.replace("Bearer ", "");
    const response = await fetch(
      `${API_BASE_URL}/reports/reports/materials?sort=name&start=${startDate}&end=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Materials API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
