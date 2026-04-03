import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GameAnalysisClient from "@/components/GameAnalysisClient";

interface Props {
  params: Promise<{ gameId: string }>;
}

export default async function GameAnalysisPage({ params }: Props) {
  const { gameId } = await params;
  const session = await auth();
  if (!session?.user?.name) redirect("/api/auth/signin");

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      whitePlayer: { select: { username: true } },
      blackPlayer: { select: { username: true } },
    },
  });

  if (!game) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500">Game not found.</p>
      </div>
    );
  }

  return (
    <GameAnalysisClient
      pgn={game.pgn}
      whiteName={game.whitePlayer.username}
      blackName={game.blackPlayer.username}
      result={game.result}
    />
  );
}
