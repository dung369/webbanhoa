import { NextResponse } from "next/server";
export const runtime = "nodejs";
import fs from "fs";
import path from "path";
import { firestore } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "feedback.json");

async function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

async function readData() {
  await ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

async function writeData(arr: any[]) {
  await ensureDirs();
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
}

export async function GET() {
  try {
    if (firestore) {
      const q = query(
        collection(firestore, "feedback"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() || {}),
      }));
      return NextResponse.json(items);
    }
    const arr = await readData();
    return NextResponse.json(arr);
  } catch (err) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // accept flexible payload for chat: senderId, recipientId, name, email, message, role
    const { userId, senderId, recipientId, name, email, message, role, subject, phone } =
      body as any;
    const finalMessage = message || body?.text || null;
    if (!finalMessage)
      return NextResponse.json({ error: "missing message" }, { status: 400 });

    const record: any = {
      // legacy support: 'userId' field may represent sender
      senderId: senderId || userId || null,
      recipientId: recipientId || null,
      name: name || null,
      email: email || null,
      subject: subject || null,
      phone: phone || null,
      message: finalMessage,
      role: role || (senderId || userId ? "customer" : "admin"),
      createdAt: new Date().toISOString(),
    };

    if (firestore) {
      const col = collection(firestore, "feedback");
      const docRef = await addDoc(col, { ...record });
      return NextResponse.json({ id: docRef.id, ...record });
    }

    const arr = await readData();
    const localRec = { id: `local_fb_${Date.now()}`, ...record };
    arr.unshift(localRec);
    await writeData(arr);
    return NextResponse.json(localRec);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("feedback POST error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    if (firestore) {
      // Firestore delete should be handled server-side with admin SDK; skip here
      return NextResponse.json(
        { error: "delete not supported for Firestore via this route" },
        { status: 400 }
      );
    }

    const arr = await readData();
    const idx = arr.findIndex((r: any) => r.id === id);
    if (idx === -1)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    const [removed] = arr.splice(idx, 1);
    await writeData(arr);
    return NextResponse.json({ ok: true, removed });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("feedback DELETE error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
