import { NextResponse } from "next/server";
import path from "path";
import { readdir, readFile, stat } from "fs/promises";

type ApiRouteInfo = {
  path: string;
  methods: string[];
  file: string;
};

const API_ROOT = path.join(process.cwd(), "app", "api");
const METHOD_REGEX =
  /\bexport\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/gi;
const METHOD_CONST_REGEX =
  /\bexport\s+const\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/gi;

async function walkRoutes(dir: string, acc: ApiRouteInfo[]) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkRoutes(fullPath, acc);
      continue;
    }

    if (entry.isFile() && entry.name === "route.ts") {
      const relativePath = path.relative(API_ROOT, fullPath).replace(/\\/g, "/");
      const routePath = buildRoutePath(relativePath);
      const methods = await extractMethods(fullPath);
      acc.push({ path: routePath, methods, file: relativePath });
    }
  }
}

function buildRoutePath(relativeRouteFile: string) {
  // Remove trailing "/route.ts" segment
  const routeSegment = relativeRouteFile.replace(/\/route\.ts$/, "");
  if (!routeSegment) return "/api";
  return `/api/${routeSegment}`;
}

async function extractMethods(filePath: string) {
  const content = await readFile(filePath, "utf8");
  const methods = new Set<string>();

  for (const match of content.matchAll(METHOD_REGEX)) {
    methods.add(match[1].toUpperCase());
  }

  for (const match of content.matchAll(METHOD_CONST_REGEX)) {
    methods.add(match[1].toUpperCase());
  }

  return Array.from(methods).sort();
}

export async function GET() {
  try {
    const exists = await stat(API_ROOT);
    if (!exists.isDirectory()) {
      return NextResponse.json(
        { success: false, message: "API directory not found" },
        { status: 500 }
      );
    }

    const routes: ApiRouteInfo[] = [];
    await walkRoutes(API_ROOT, routes);

    // Sort by path for stable output
    routes.sort((a, b) => a.path.localeCompare(b.path));

    return NextResponse.json({ success: true, data: routes });
  } catch (error) {
    console.error("Error listing API routes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to list API routes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
