"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Check, X, Search, Trophy, Clock } from "lucide-react";

interface UserInfo { id: string; username: string; rating: number; }
interface PendingRequest { id: string; sender: UserInfo; }
interface OutgoingRequest { id: string; receiver: UserInfo; }

export default function FriendsPage() {
  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<PendingRequest[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<OutgoingRequest[]>([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchMsg, setSearchMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchFriends() {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      setFriends(data.friends || []);
      setPendingIncoming(data.pendingIncoming || []);
      setPendingOutgoing(data.pendingOutgoing || []);
    } catch { /* */ } finally { setLoading(false); }
  }

  useEffect(() => { fetchFriends(); }, []);

  async function sendRequest() {
    if (!searchUsername.trim()) return;
    setSearchMsg("");
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", targetUsername: searchUsername.trim() }),
      });
      const data = await res.json();
      if (res.ok) { setSearchMsg("Request sent!"); setSearchUsername(""); fetchFriends(); }
      else setSearchMsg(data.error || "Failed");
    } catch { setSearchMsg("Network error"); }
  }

  async function respondRequest(requestId: string, action: "accept" | "reject") {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, requestId }),
    });
    fetchFriends();
  }

  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3 mb-6">
          <Users className="w-6 h-6" /> Friends
        </h1>

        {/* Add Friend */}
        <div className="rounded-xl bg-surface-1 border border-border p-4 mb-4">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Add Friend
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendRequest()}
                placeholder="Enter username..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-0 border border-border text-sm text-text-primary focus:outline-none focus:border-accent placeholder-text-muted"
              />
            </div>
            <button onClick={sendRequest} className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-sm font-semibold text-white transition-colors">
              Send
            </button>
          </div>
          {searchMsg && <p className={`mt-2 text-xs font-medium ${searchMsg.includes("sent") ? "text-accent" : "text-danger"}`}>{searchMsg}</p>}
        </div>

        {/* Pending Incoming */}
        {pendingIncoming.length > 0 && (
          <div className="rounded-xl bg-surface-1 border border-border overflow-hidden mb-4">
            <div className="px-4 py-2.5 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Incoming ({pendingIncoming.length})
            </div>
            {pendingIncoming.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-2/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-sm font-bold text-white">
                    {req.sender.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{req.sender.username}</div>
                    <div className="text-xs text-text-muted">{req.sender.rating} Elo</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => respondRequest(req.id, "accept")} className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => respondRequest(req.id, "reject")} className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friends List */}
        <div className="rounded-xl bg-surface-1 border border-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider">
            Friends ({friends.length})
          </div>
          {loading ? (
            <div className="py-8 text-center text-text-muted text-sm">Loading...</div>
          ) : friends.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No friends yet. Search above to add someone.</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-2/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-3 flex items-center justify-center text-sm font-bold text-text-secondary">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{friend.username}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Trophy className="w-3 h-3 text-gold" /> {friend.rating}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
