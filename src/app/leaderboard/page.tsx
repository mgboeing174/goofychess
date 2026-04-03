import { prisma } from "@/lib/prisma";
import { Trophy, Crown, Medal } from "lucide-react";

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    orderBy: { rating: "desc" },
    take: 50,
    select: { id: true, username: true, rating: true, wins: true, losses: true, draws: true },
  });

  function getWinRate(w: number, l: number, d: number) {
    const total = w + l + d;
    if (total === 0) return "—";
    return Math.round((w / total) * 100) + "%";
  }

  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
        </div>

        <div className="rounded-xl bg-surface-1 border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-surface-2/50">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Rating</div>
            <div className="col-span-2 text-center">W/L/D</div>
            <div className="col-span-2 text-center">Win %</div>
          </div>

          {users.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No players yet.</div>
          ) : (
            users.map((user, i) => {
              const rank = i + 1;
              return (
                <div key={user.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border last:border-b-0 hover:bg-surface-2/30 transition-colors">
                  <div className="col-span-1">
                    {rank === 1 && <Crown className="w-4 h-4 text-gold" />}
                    {rank === 2 && <Medal className="w-4 h-4 text-text-secondary" />}
                    {rank === 3 && <Medal className="w-4 h-4 text-[#cd7f32]" />}
                    {rank > 3 && <span className="text-xs font-mono text-text-muted">{rank}</span>}
                  </div>
                  <div className="col-span-5 flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${rank <= 3 ? "bg-accent text-white" : "bg-surface-3 text-text-muted"}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-text-primary truncate">{user.username}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-bold ${user.rating >= 1600 ? "text-gold" : user.rating >= 1400 ? "text-accent" : "text-text-primary"}`}>
                      {user.rating}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-xs font-mono text-text-secondary">
                    <span className="text-accent">{user.wins}</span>/<span className="text-danger">{user.losses}</span>/<span className="text-text-muted">{user.draws}</span>
                  </div>
                  <div className="col-span-2 text-center text-sm font-medium text-text-secondary">
                    {getWinRate(user.wins, user.losses, user.draws)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
