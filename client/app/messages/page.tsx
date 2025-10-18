"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { EmployerDashboardNavbar } from "@/components/employer-dashboard-navbar"

interface Conversation {
  id: string
  title?: string
  lastMessageAt?: string
  unreadCount: number
  isUnread: boolean
  otherParticipant: { id: string; name?: string; email?: string }
}

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loadingThread, setLoadingThread] = useState(false)
  const [coworkers, setCoworkers] = useState<any[]>([])
  const [startingWith, setStartingWith] = useState<string>("")

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace("/login"); return }
    void loadConversations()
  }, [user, loading])

  const loadConversations = async () => {
    const res = await apiService.getConversations()
    if (res.success && Array.isArray(res.data)) setConversations(res.data as any)
    const list = await apiService.getCompanyUsersForMessaging()
    if (list.success && Array.isArray(list.data)) setCoworkers(list.data)
  }

  const openConversation = async (id: string) => {
    setSelectedId(id)
    setLoadingThread(true)
    const res = await apiService.getMessages(id, 1, 50)
    if (res.success && res.data?.messages) setMessages(res.data.messages)
    setLoadingThread(false)
    // mark read
    await apiService.markConversationRead(id)
    await loadConversations()
  }

  const send = async () => {
    if (!selectedId || !input.trim()) return
    const res = await apiService.sendMessage(selectedId, input.trim(), "text")
    if (res.success) {
      setInput("")
      // reload thread
      const r = await apiService.getMessages(selectedId, 1, 50)
      if (r.success && r.data?.messages) setMessages(r.data.messages)
    }
  }

  const startConversation = async (receiverId?: string) => {
    const targetId = receiverId || startingWith
    if (!targetId) return
    const res = await apiService.startConversation(targetId)
    if (res.success && res.data?.id) {
      await loadConversations()
      await openConversation(res.data.id)
      setStartingWith("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden">
      <EmployerDashboardNavbar />
      
      {/* Background Effects - Blue theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base blue gradient overlay to ensure visible background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/45 via-cyan-200/35 to-indigo-200/45"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-br from-indigo-300/10 to-violet-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-cyan-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        {/* Wide translucent blue gradient strip */}
        <div className="absolute top-1/3 left-0 right-0 h-24 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-indigo-400/20"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto pt-16 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-3xl bg-white/50 backdrop-blur-2xl border-white/40 shadow-[0_8px_28px_rgba(59,130,246,0.08)] hover:shadow-[0_18px_60px_rgba(59,130,246,0.16)] p-3">
          <div className="font-semibold mb-3">Conversations</div>
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`w-full text-left border rounded p-2 ${selectedId === c.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{c.otherParticipant?.name || c.otherParticipant?.email || 'Conversation'}</div>
                  {c.unreadCount > 0 && (
                    <span className="text-xs bg-blue-600 text-white rounded px-2">{c.unreadCount}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : ''}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 border-t pt-3">
            <div className="text-sm font-medium mb-2">Start new chat</div>
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-sm flex-1"
                value={startingWith}
                onChange={(e) => setStartingWith(e.target.value)}
              >
                <option value="">Select coworker</option>
                {coworkers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
              <button onClick={() => startConversation()} className="px-3 py-1 border rounded text-sm">Start</button>
            </div>
            {/* Quick coworker list */}
            <div className="mt-3 grid grid-cols-1 gap-2">
              {coworkers.map((u) => (
                <button key={u.id} className="w-full text-left text-sm border rounded px-2 py-2 hover:bg-gray-50"
                  onClick={async () => { await startConversation(u.id); }}>
                  {u.name || u.email}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 border rounded bg-white flex flex-col min-h-[60vh]">
          {!selectedId ? (
            <div className="flex-1 grid place-items-center text-gray-500">
              <div className="text-center p-6">
                <div className="text-lg font-semibold mb-2">Start messaging</div>
                <p className="text-sm mb-4">Choose a coworker from the left, or pick from suggestions below.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {coworkers.slice(0, 6).map((u) => (
                    <button key={u.id} className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                      onClick={async () => { await startConversation(u.id); }}>
                      {u.name || u.email}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto p-3">
                {loadingThread ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`max-w-[80%] ${m.isFromMe ? 'ml-auto text-right' : ''}`}>
                        <div className={`inline-block rounded px-3 py-2 ${m.isFromMe ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                          <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                          <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t p-2 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  placeholder="Type a message..."
                />
                <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
