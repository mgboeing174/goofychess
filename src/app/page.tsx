import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Bot, Users, Monitor, Trophy, TrendingUp, ChevronRight, Swords } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Fetch quick stats
  let userRating: number | null = null;
  let totalPlayers = 0;
  try {
    totalPlayers = await prisma.user.count();
    if (session?.user?.name) {
      const user = await prisma.user.findUnique({
        where: { username: session.user.name },
        select: { rating: true },
      });
      userRating = user?.rating ?? null;
    }
  } catch { /* ignore */ }

  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Play */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero */}
            <div className="rounded-xl bg-surface-1 border border-border overflow-hidden">
              <div className="p-8 md:p-10 bg-gradient-to-br from-accent/5 to-transparent">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-text-primary">
                  Play Chess
                </h1>
                <p className="text-text-secondary text-base max-w-md leading-relaxed mb-6">
                  Challenge bots, compete online, or play with a friend — all in your browser.
                </p>
                <Link
                  href="/play/bot"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover transition-colors text-sm font-bold text-white"
                >
                  <Bot className="w-5 h-5" /> Play Now
                </Link>
              </div>
            </div>

            {/* Game Mode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/play/bot" className="group flex flex-col p-5 rounded-xl bg-surface-1 border border-border hover:border-accent/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-sm mb-1 text-text-primary">Play vs Bot</h3>
                <p className="text-xs text-text-muted leading-relaxed flex-1">From easy to master level.</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-accent font-medium">
                  Play <ChevronRight className="w-3 h-3" />
                </div>
              </Link>

              <Link href="/play/online" className="group flex flex-col p-5 rounded-xl bg-surface-1 border border-border hover:border-gold/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-sm mb-1 text-text-primary">Play Online</h3>
                <p className="text-xs text-text-muted leading-relaxed flex-1">Rated matches vs real players.</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gold font-medium">
                  Coming Soon <ChevronRight className="w-3 h-3" />
                </div>
              </Link>

              <Link href="/play/offline" className="group flex flex-col p-5 rounded-xl bg-surface-1 border border-border hover:border-text-muted/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-text-muted/10 flex items-center justify-center mb-3 group-hover:bg-text-muted/20 transition-colors">
                  <Monitor className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="font-bold text-sm mb-1 text-text-primary">Pass & Play</h3>
                <p className="text-xs text-text-muted leading-relaxed flex-1">Offline on the same screen.</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-text-secondary font-medium">
                  Play <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-4">
            {/* Player Card */}
            {session?.user ? (
              <Link href="/profile" className="block rounded-xl bg-surface-1 border border-border p-5 hover:border-accent/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-xl font-bold text-white">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">{session.user.name}</div>
                    {userRating && (
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Trophy className="w-3.5 h-3.5 text-gold" /> {userRating} Elo
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent font-medium">
                  View Profile <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ) : (
              <div className="rounded-xl bg-surface-1 border border-border p-5">
                <h3 className="font-bold text-sm mb-2 text-text-primary">Welcome!</h3>
                <p className="text-xs text-text-muted mb-4">Sign in to track your rating, add friends, and analyze your games.</p>
                <Link href="/api/auth/signin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover transition-colors text-sm font-semibold text-white">
                  Sign In
                </Link>
              </div>
            )}

            {/* Quick Links */}
            <div className="rounded-xl bg-surface-1 border border-border divide-y divide-border">
              <Link href="/leaderboard" className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors first:rounded-t-xl">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-text-primary flex-1">Leaderboard</span>
                <span className="text-xs text-text-muted">{totalPlayers} players</span>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              </Link>
              {session?.user && (
                <>
                  <Link href="/friends" className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary flex-1">Friends</span>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </Link>
                  <Link href="/analysis" className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors last:rounded-b-xl">
                    <TrendingUp className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary flex-1">Game Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </Link>
                </>
              )}
            </div>

            {/* Features */}
            <div className="rounded-xl bg-surface-1 border border-border p-5 space-y-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Features</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Swords className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">4 Bot Difficulties</div>
                    <div className="text-xs text-text-muted">From random moves to depth-4 search</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Trophy className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">Elo Ratings</div>
                    <div className="text-xs text-text-muted">Dynamic rating after every game</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TrendingUp className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">AI Analysis</div>
                    <div className="text-xs text-text-muted">Move-by-move game review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
