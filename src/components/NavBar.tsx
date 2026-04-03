import Link from "next/link";
import { auth } from "@/auth";
import { LogIn, ChevronDown, Users, Trophy, Search, Gamepad2 } from "lucide-react";

export default async function NavBar() {
  const session = await auth();

  return (
    <nav className="w-full h-14 bg-surface-1 border-b border-border sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-surface-2 transition-colors mr-2">
            <div className="w-7 h-7 rounded bg-accent flex items-center justify-center">
              <span className="text-sm font-black text-white">♞</span>
            </div>
            <span className="text-base font-bold text-text-primary hidden sm:block">ChessPlatform</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
            <Gamepad2 className="w-4 h-4" /> <span className="hidden md:inline">Play</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
            <Trophy className="w-4 h-4" /> <span className="hidden md:inline">Leaderboard</span>
          </Link>
          {session?.user && (
            <>
              <Link href="/friends" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                <Users className="w-4 h-4" /> <span className="hidden md:inline">Friends</span>
              </Link>
              <Link href="/analysis" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                <Search className="w-4 h-4" /> <span className="hidden md:inline">Analysis</span>
              </Link>
            </>
          )}
        </div>

        {/* Right: User */}
        <div>
          {session?.user ? (
            <Link href="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-surface-2 transition-colors">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-text-primary hidden sm:block">{session.user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </Link>
          ) : (
            <Link href="/api/auth/signin" className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover transition-colors text-sm font-semibold text-white">
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
