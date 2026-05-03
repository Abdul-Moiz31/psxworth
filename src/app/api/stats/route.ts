import { fetchStatsSummary } from "@/actions/status/stats";
import { NextRequest, NextResponse } from "next/server";

// Allowed origins - all variants of wajahatgul.com
const allowedOrigins = [
  "https://www.wajahatgul.com",
  "https://wajahatgul.com",
  "http://www.wajahatgul.com",
  "http://wajahatgul.com",
];

// Function to get CORS headers based on request origin
function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

// Handle preflight OPTIONS request
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Extract credentials from Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401, headers: corsHeaders });
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [username, password] = credentials.split(":");

    // Hardcoded authentication
    if (username !== "Wajahat" || password !== "WajahatWitcherRings") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401, headers: corsHeaders });
    }

    const data = await fetchStatsSummary();

    if (data?.totalUsers === 0 && data?.totalTransactions === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stats temporarily unavailable",
        },
        { status: 503, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
