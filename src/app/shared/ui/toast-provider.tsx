"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

type ToastVariant = "success" | "error" | "info"

type ToastMessage = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (input: Omit<ToastMessage, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const showToast = useCallback((input: Omit<ToastMessage, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)

    setMessages((prev) => [...prev, { id, ...input }])

    window.setTimeout(() => {
      setMessages((prev) => prev.filter((message) => message.id !== id))
    }, 3500)
  }, [])

  const contextValue = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <section className="toast-stack" aria-live="polite" aria-atomic="true">
        {messages.map((message) => (
          <article key={message.id} className={`toast toast--${message.variant}`}>
            <strong>{message.title}</strong>
            {message.description ? <p>{message.description}</p> : null}
          </article>
        ))}
      </section>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }

  return context
}
