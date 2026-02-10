import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPaperPlane, faRobot, faUser, faBolt } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { MyAppContext } from '../AppContext/MyContext'
import userPhotoFallback from '../assets/user.png'
import chatbot from '../assets/chatbot.png'
import { db } from '../firebase/firebaseService'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const WEBHOOK_URL = 'https://n8n.srv871507.hstgr.cloud/webhook/chat-bot'

// ----------------- Small UI atoms -----------------
const TypingDots = () => (
  <div className="flex items-center gap-1">
    <span className="w-[6px] h-[6px] rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
    <span className="w-[6px] h-[6px] rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
    <span className="w-[6px] h-[6px] rounded-full bg-slate-400 animate-bounce" />
  </div>
)

const Avatar = ({ src, alt, className = '' }) => (
  <img
    src={src}
    alt={alt}
    className={`w-8 h-8 rounded-full ring-1 ring-slate-700/40 ${className}`}
    onError={(e) => { e.currentTarget.src = userPhotoFallback }}
  />
)

const Bubble = ({ role, children, userAvatar }) => {
  const isUser = role === 'user'
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <Avatar src={chatbot} alt="AI" className="mr-2 self-start shrink-0" />}
      <div
        className={[
          'max-w-[82%] md:max-w-[70%] lg:max-w-[62%] whitespace-pre-wrap break-words',
          'px-4 py-2.5 rounded-2xl shadow-sm',
          isUser
            ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white dark:from-slate-800 dark:to-slate-800 dark:text-slate-100'
            : 'bg-white text-slate-900 border border-slate-200/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/50',
        ].join(' ')}
      >
        {children}
      </div>
      {isUser && <Avatar src={userAvatar} alt="You" className="ml-2 self-start shrink-0" />}
    </div>
  )
}

// ----------------- Main component -----------------
const HEADER_H = 72
const FOOTER_H = 84

const PQHubAI = () => {
  const [userInput, setUserInput] = useState('')
  const [prevMsgs, setPrevMsgs] = useState([]) // [{text, role, date, userId?, typing?, _id?}]
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userData, setUserData] = useState({})
  const [typingId, setTypingId] = useState(null) // track the inline typing bubble
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const { user } = useContext(MyAppContext)

  const userAvatarSrc = userData?.profilePicture || user?.photoURL || userPhotoFallback

  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])

  const scrollToBottom = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  // ---------- Networking (kept logic) ----------
  const postToWebhook = async (payload) => {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // simple request to reduce preflight
        body: JSON.stringify(payload),
      })
      const text = await res.text().catch(() => '')
      return { ok: res.ok, status: res.status, text }
    } catch {
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
          mode: 'no-cors',
        })
        return { ok: false, status: 0, text: '' }
      } catch {
        return { ok: false, status: 0, text: '' }
      }
    }
  }

  const saveMessage = async (msg) => {
    if (!user?.uid) return
    const chatDoc = doc(db, 'AI-Chats', user.uid)
    const chatSnap = await getDoc(chatDoc)
    if (!chatSnap.exists()) {
      await setDoc(chatDoc, { messages: [msg] })
    } else {
      await updateDoc(chatDoc, { messages: arrayUnion(msg) })
    }
  }

  // Typewriter for AI message; updates one existing item (typing placeholder)
  const typewriterIntoMsg = (fullText, msgId, onDone) => {
    let i = 0
    const step = () => {
      if (i <= fullText.length) {
        const partial = fullText.slice(0, i)
        setPrevMsgs((prev) => {
          const copy = [...prev]
          const idx = copy.findIndex((m) => m._id === msgId)
          if (idx >= 0) {
            copy[idx] = { ...copy[idx], text: partial, typing: false } // typing false once text starts appearing
          }
          return copy
        })
        i += Math.max(1, Math.floor(fullText.length / 110))
        scrollToBottom()
        setTimeout(step, 10)
      } else {
        onDone && onDone()
      }
    }
    step()
  }

  // ---------- Send flow (logic intact; improved UX) ----------
  const send = async () => {
    const question = userInput.trim()
    if (!question || !user?.uid) return

    // 1) Push user bubble immediately
    const userMsg = { text: question, role: 'user', date: Date.now(), userId: user.uid }
    setPrevMsgs((p) => [...p, userMsg])
    setUserInput('')
    setSending(true)
    scrollToBottom()

    // persist user message (unchanged logic)
    try { await saveMessage(userMsg) } catch (e) { console.log('save user msg:', e) }

    // 2) Insert an inline "typing" bubble RIGHT AWAY (not waiting for network)
    const tmpId = `typing-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTypingId(tmpId)
    setPrevMsgs((p) => [...p, { role: 'ai', text: '', typing: true, date: Date.now(), _id: tmpId }])
    scrollToBottom()

    // 3) Webhook request (unchanged logic)
    const payload = {
      user: {
        id: user.uid,
        email: userData?.email || null,
        name: userData?.displayName || userData?.fullName || null,
      },
      question,
      context: { source: 'pqhub-ai', ts: Date.now() },
    }
    const result = await postToWebhook(payload)

    setSending(false)

    // 4) Prepare AI text
    let aiText = ''
    if (result.ok && result.text) aiText = result.text
    else if (!result.ok && result.status === 0) aiText = "I'm having trouble reaching the assistant right now. Please try again shortly."
    else aiText = "Sorry, I couldn't process that request just now."

    // 5) Replace the typing bubble by typing the response into it
    typewriterIntoMsg(aiText, tmpId, async () => {
      // persist final AI message (do not save the temporary typing state)
      const finalAiMsg = { text: aiText, role: 'ai', date: Date.now() }
      try { await saveMessage(finalAiMsg) } catch (e) { console.log('save ai msg:', e) }
      setTypingId(null)
      scrollToBottom()
    })
  }

  // ---------- Lifecycle ----------
  useEffect(() => {
    document.title = 'AI Chatbot'
    if (!user?.uid) return
    ;(async () => {
      try {
        const chatDocRef = doc(db, 'AI-Chats', user.uid)
        const userDocRef = doc(db, 'Users', user.uid)
        const [userSnap, chatSnap] = await Promise.all([getDoc(userDocRef), getDoc(chatDocRef)])
        setUserData(userSnap.data() || {})
        if (chatSnap.exists()) setPrevMsgs(chatSnap.data().messages || [])
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
        setTimeout(scrollToBottom, 0)
      }
    })()
  }, [user?.uid])

  // Keep view pinned to bottom as messages change
  useEffect(() => { scrollToBottom() }, [prevMsgs, typingId])

  // Enter to send
  useEffect(() => {
    const onEnter = (e) => { if (e.key === 'Enter') send() }
    window.addEventListener('keydown', onEnter)
    return () => window.removeEventListener('keydown', onEnter)
  }, [userInput, loading])

  // ----------------- UI -----------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* App bar */}
      <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <Link to="/chats" className="shrink-0 rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800/70">
              <FontAwesomeIcon icon={faArrowLeft} className="text-slate-700 dark:text-slate-200" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={chatbot} alt="AI" className="w-10 h-10 rounded-full ring-2 ring-blue-500/40" />
                <span className="absolute -right-0 -bottom-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faRobot} className="text-blue-600" />
                  AI Assistant
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Ask anything about PQHub</div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FontAwesomeIcon icon={faBolt} /> Smart replies enabled
          </div>
        </div>
      </header>

      {/* Chat body */}
      <main className="max-w-5xl mx-auto">
        <div
          ref={scrollRef}
          className="relative px-3 md:px-4 lg:px-6"
          style={{ height: `calc(100vh - ${HEADER_H + FOOTER_H}px)`, overflowY: 'auto' }}
        >
          {/* Intro / empty state */}
          {!loading && prevMsgs.length === 0 && (
            <div className="pt-8 pb-4 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 ring-1 ring-slate-200/70 dark:ring-slate-700/50 grid place-items-center">
                <FontAwesomeIcon icon={faRobot} className="text-blue-600" />
              </div>
              <div className="max-w-[680px]">
                <div className="font-medium mb-1">Welcome to PQHub Assistant</div>
                <div>Ask questions about posts, points, redemptions and more. I’ll answer and keep your history here.</div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="pt-4 pb-6 flex flex-col gap-3">
            {prevMsgs.map((m, idx) => (
              <Bubble
                key={m._id || idx}
                role={m.role}
                userAvatar={userAvatarSrc}
              >
                {m.typing ? <TypingDots /> : m.text}
              </Bubble>
            ))}
          </div>
        </div>
      </main>

      {/* Composer */}
      <footer
        className="sticky bottom-0 z-20 border-t border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur"
        style={{ height: FOOTER_H }}
      >
        <div className="max-w-5xl mx-auto h-full px-3 md:px-4 lg:px-6 flex items-center">
          <div className="w-full flex items-center gap-2">
            <div className="shrink-0 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/70 dark:ring-slate-700/50 overflow-hidden">
              <Avatar src={userAvatarSrc} alt="You" className="ring-0 w-10 h-10" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={sending ? 'Sending…' : 'Ask your question…'}
              disabled={sending}
              className="flex-1 px-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/50 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 dark:focus:ring-cyan-600/40 dark:focus:border-cyan-600/40 text-sm"
            />
            <button
              onClick={() => { if (userInput.trim() && !loading && !sending) send() }}
              disabled={sending || !userInput.trim()}
              className={`h-11 px-4 rounded-xl text-white text-sm transition-colors ${
                userInput.trim() && !sending
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
              title="Send"
              aria-label="Send"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </footer>

      {/* Initial global loader (unchanged behavior) */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-pulse text-slate-500">Loading…</div>
        </div>
      )}
    </div>
  )
}

export default PQHubAI
