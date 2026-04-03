import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends — list friends & pending requests
export async function GET() {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { username: session.user.name } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Friends = accepted requests (both sent and received)
  const friendRequests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: user.id, status: "accepted" },
        { receiverId: user.id, status: "accepted" },
      ],
    },
    include: {
      sender: { select: { id: true, username: true, rating: true } },
      receiver: { select: { id: true, username: true, rating: true } },
    },
  });

  const friends = friendRequests.map((fr) =>
    fr.senderId === user.id ? fr.receiver : fr.sender
  );

  // Pending incoming
  const pendingIncoming = await prisma.friendRequest.findMany({
    where: { receiverId: user.id, status: "pending" },
    include: { sender: { select: { id: true, username: true, rating: true } } },
  });

  // Pending outgoing
  const pendingOutgoing = await prisma.friendRequest.findMany({
    where: { senderId: user.id, status: "pending" },
    include: { receiver: { select: { id: true, username: true, rating: true } } },
  });

  return NextResponse.json({ friends, pendingIncoming, pendingOutgoing });
}

// POST /api/friends — send / accept / reject
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { username: session.user.name } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { action, targetUsername, requestId } = body;

  if (action === "send") {
    if (!targetUsername) return NextResponse.json({ error: "Missing targetUsername" }, { status: 400 });
    if (targetUsername === user.username) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check existing
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: target.id },
          { senderId: target.id, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Request already exists" }, { status: 409 });
    }

    await prisma.friendRequest.create({
      data: { senderId: user.id, receiverId: target.id },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "accept" || action === "reject") {
    if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== user.id) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: action === "accept" ? "accepted" : "rejected" },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
