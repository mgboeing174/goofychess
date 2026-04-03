import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Trophy, History, TrendingUp, Target, Search, ChevronRight } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.name) redirect("/api/auth/signin")

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
    include: {
      gamesAsWhite: { orderBy: { createdAt: "desc" }, take: 10, include: { blackPlayer: { select: { username: true } } } },
      gamesAsBlack: { orderBy: { createdAt: "desc" }, take: 10, include: { whitePlayer: { select: { username: true } } } },
    }
  })
  if (!user) return <div>User not found</div>

  const totalGames = user.wins + user.losses + user.draws
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0

  const recentGames = [
    ...user.gamesAsWhite.map(g => ({ ...g, playerColor: "white" as const, opponent: g.blackPlayer.username })),
    ...user.gamesAsBlack.map(g => ({ ...g, playerColor: "black" as const, opponent: g.whitePlayer.username })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="rounded-xl bg-surface-1 border border-border overflow-hidden mb-4">
          <div className="h-1.5 bg-gradient-to-r from-accent via-gold to-accent" />
          <div className="p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary">{user.username}</h1>
              <p className="text-sm text-text-muted">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 border-t border-border">
            <div className="px-4 py-4 text-center border-r border-border">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Trophy className="w-3 h-3 text-gold" />Rating</div>
              <div className="text-xl font-bold text-text-primary">{user.rating}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-border">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Games</div>
              <div className="text-xl font-bold text-text-primary">{totalGames}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-border">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3 text-accent" />Win%</div>
              <div className="text-xl font-bold text-accent">{winRate}%</div>
            </div>
            <div className="px-4 py-4 text-center">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Target className="w-3 h-3" />W/L/D</div>
              <div className="text-lg font-bold">
                <span className="text-accent">{user.wins}</span>
                <span className="text-text-muted mx-0.5">/</span>
                <span className="text-danger">{user.losses}</span>
                <span className="text-text-muted mx-0.5">/</span>
                <span className="text-text-muted">{user.draws}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Games */}
        <div className="rounded-xl bg-surface-1 border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Games
            </span>
            <Link href="/analysis" className="text-xs text-accent flex items-center gap-0.5 hover:underline font-medium">
              <Search className="w-3 h-3" /> Analyze <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentGames.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No games yet. Go play!</div>
          ) : (
            recentGames.map((game) => {
              const won = (game.playerColor === "white" && game.result === "1-0") || (game.playerColor === "black" && game.result === "0-1");
              const draw = game.result === "1/2-1/2";
              return (
                <Link key={game.id} href={`/analysis/${game.id}`} className="flex items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-2/30 transition-colors">
                  <div className={`w-1 h-8 rounded-full mr-3 ${won ? "bg-accent" : draw ? "bg-text-muted" : "bg-danger"}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">vs {game.opponent}</div>
                    <div className="text-xs text-text-muted">{game.playerColor === "white" ? "♔ White" : "♚ Black"} · {new Date(game.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-sm font-bold ${won ? "text-accent" : draw ? "text-text-muted" : "text-danger"}`}>
                    {won ? "Won" : draw ? "Draw" : "Lost"}
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
