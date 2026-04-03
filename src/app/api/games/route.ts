import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { result, pgn, mode } = body;

  if (!result || !pgn) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // For bot games, the user is always white or black and the "opponent" is a bot placeholder
  // We use the same user ID as both players for bot games and differentiate by mode
  const game = await prisma.game.create({
    data: {
      whitePlayerId: user.id,
      blackPlayerId: user.id, // Bot placeholder
      pgn,
      result,
    },
  });

  return NextResponse.json({ success: true, gameId: game.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const games = await prisma.game.findMany({
    where: {
      OR: [
        { whitePlayerId: user.id },
        { blackPlayerId: user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      whitePlayer: { select: { username: true, rating: true } },
      blackPlayer: { select: { username: true, rating: true } },
    },
  });

  return NextResponse.json({ games });
}
