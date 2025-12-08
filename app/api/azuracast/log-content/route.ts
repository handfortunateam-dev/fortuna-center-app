import { NextResponse } from "next/server";
import { resolveUrl } from "@/services/azurecast/helpers";

const API_KEY = process.env.AZURACAST_API_KEY;

export async function GET(req: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { message: "AZURACAST_API_KEY belum diset." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { message: "Parameter 'path' wajib diisi." },
      { status: 400 }
    );
  }

  // Pastikan path selalu diawali dengan slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let fullUrl: string;
  try {
    fullUrl = resolveUrl(normalizedPath);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal membangun URL AzuraCast.";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const upstream = await fetch(fullUrl, {
      headers: {
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return new NextResponse(
        text || `Gagal mengambil log (${upstream.status})`,
        {
          status: upstream.status,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mengambil log dari server.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
