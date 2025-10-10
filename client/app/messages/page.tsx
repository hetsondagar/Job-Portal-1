"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"

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

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace("/login"); return }
    void loadConversations()
  }, [user, loading])

  const loadConversations = async () => {
    const res = await apiService.getConversations()
    if (res.success && Array.isArray(res.data)) setConversations(res.data as any)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded bg-white p-3">
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
        </div>

        <div className="md:col-span-2 border rounded bg-white flex flex-col min-h-[60vh]">
          {!selectedId ? (
            <div className="flex-1 grid place-items-center text-gray-500">Select a conversation</div>
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
