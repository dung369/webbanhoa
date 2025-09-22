import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.resolve(process.cwd(), "data");
const CUSTOMERS_FILE = path.join(DATA_PATH, "customers.json");

async function ensureCustomersFile() {
  if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
  if (!fs.existsSync(CUSTOMERS_FILE)) fs.writeFileSync(CUSTOMERS_FILE, "[]");
}

export async function GET() {
  try {
    await ensureCustomersFile();
    const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    return NextResponse.json({ ok: true, customers: arr });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureCustomersFile();
    const body = await req.json();
    const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    const existing = arr.find((c: any) => c.email === body.email);
    if (existing) {
      Object.assign(existing, body);
    } else {
      const id = `cust_${Date.now()}`;
      arr.push({ id, ...body });
    }
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(arr, null, 2));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await ensureCustomersFile();
    const body = await req.json();
    const { id } = body;
    if (!id)
      return NextResponse.json(
        { ok: false, error: "missing id" },
        { status: 400 }
      );
    const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx === -1)
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 }
      );
    const [removed] = arr.splice(idx, 1);
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(arr, null, 2));
    return NextResponse.json({ ok: true, removed });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
