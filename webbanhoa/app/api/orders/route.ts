import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.resolve(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_PATH, "orders.json");

async function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

export async function POST(req: Request) {
  try {
    await ensureDataFile();
    const body = await req.json();
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    const id = `ord_${Date.now()}`;
    const item = { id, createdAt: new Date().toISOString(), ...body };
    arr.push(item);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2));
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    return NextResponse.json({ ok: true, orders: arr });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await ensureDataFile();
    const body = await req.json();
    const { id, status } = body;
    if (!id)
      return NextResponse.json(
        { ok: false, error: "missing id" },
        { status: 400 }
      );
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    const idx = arr.findIndex((o: any) => o.id === id);
    if (idx === -1)
      return NextResponse.json(
        { ok: false, error: "order not found" },
        { status: 404 }
      );
    arr[idx].status = status || arr[idx].status;
    if (status === "delivered") {
      arr[idx].deliveredAt = new Date().toISOString();
      arr[idx].paid = true;
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2));

    // update customers.json (simple aggregation)
    const customersFile = path.join(DATA_PATH, "customers.json");
    if (!fs.existsSync(customersFile)) fs.writeFileSync(customersFile, "[]");
    const rawC = fs.readFileSync(customersFile, "utf-8");
    const customers = JSON.parse(rawC || "[]");
    const order = arr[idx];
    const existing = customers.find(
      (c: any) => c.email === (order.email || "")
    );
    if (existing) {
      existing.totalOrders = (existing.totalOrders || 0) + 1;
      existing.totalSpent =
        (existing.totalSpent || 0) + Number(order.total || 0);
      existing.lastOrder = order.createdAt;
    } else {
      customers.push({
        id: `cust_${Date.now()}`,
        name: order.fullname || "",
        email: order.email || "",
        phone: order.phone || "",
        totalOrders: 1,
        totalSpent: Number(order.total || 0),
        lastOrder: order.createdAt,
      });
    }
    fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));

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
    await ensureDataFile();
    const body = await req.json();
    const { id } = body;
    if (!id)
      return NextResponse.json(
        { ok: false, error: "missing id" },
        { status: 400 }
      );
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const arr = JSON.parse(raw || "[]");
    const idx = arr.findIndex((o: any) => o.id === id);
    if (idx === -1)
      return NextResponse.json(
        { ok: false, error: "order not found" },
        { status: 404 }
      );
    const [removed] = arr.splice(idx, 1);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2));
    return NextResponse.json({ ok: true, removed });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
