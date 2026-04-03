import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Clock, ChevronRight } from "lucide-react";

export default async function AnalysisListPage() {
  const session = await auth();
  if (!session?.user?.name) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({ where: { username: session.user.name } });
  if (!user) return <div>User not found</div>;

  const games = await prisma.game.findMany({
    where: {
      OR: [{ whitePlayerId: user.id }, { blackPlayerId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      whitePlayer: { select: { username: true } },
      blackPlayer: { select: { username: true } },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-4">
            <Search className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Game Analysis</h1>
          <p className="text-neutral-400">Review your past games move-by-move with AI coaching.</p>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500">No games to analyze yet. Play a game first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/analysis/${game.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-white border border-neutral-600" />
                    <span className="text-sm font-medium">{game.whitePlayer.username}</span>
                    <span className="text-neutral-600 mx-1">vs</span>
                    <div className="w-3 h-3 rounded-full bg-neutral-700 border border-neutral-500" />
                    <span className="text-sm font-medium">{game.blackPlayer.username}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    game.result === "1-0" ? "bg-white/10 text-white" :
                    game.result === "0-1" ? "bg-neutral-700/50 text-neutral-300" :
                    "bg-neutral-800 text-neutral-400"
                  }`}>
                    {game.result}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
