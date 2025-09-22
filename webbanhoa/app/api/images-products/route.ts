import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

function titleFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function GET() {
  try {
    if (!fs.existsSync(IMAGES_DIR)) return NextResponse.json([]);
    const files = fs.readdirSync(IMAGES_DIR);
    const images = files.filter((f) =>
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f)
    );
    const items = images.map((f) => {
      const stat = fs.statSync(path.join(IMAGES_DIR, f));
      const createdAt = stat.mtime.toISOString();
      return {
        id: `img_${f.replace(/[^a-zA-Z0-9]/g, "_")}`,
        name: titleFromFilename(f),
        description: `Ảnh sản phẩm: ${titleFromFilename(f)}`,
        price: 150000,
        inStock: 20,
        images: [`/images/${f}`],
        origin: "local-images",
        createdAt,
      };
    });
    // sort newest first
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(items);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("images-products GET error", err);
    return NextResponse.json([], { status: 500 });
  }
}
