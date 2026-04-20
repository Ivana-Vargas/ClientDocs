"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { apiRequest } from "@app/shared/lib/api-client"
import { useToast } from "@app/shared/ui/toast-provider"
import type { Locale } from "@shared/localization/config"

type LanguageSwitcherProps = {
  locale: Locale
  label: string
  englishLabel: string
  spanishLabel: string
  updatedMessage: string
  errorMessage: string
}

export function LanguageSwitcher({
  locale,
  label,
  englishLabel,
  spanishLabel,
  updatedMessage,
  errorMessage,
}: LanguageSwitcherProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  async function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale) {
      return
    }

    setIsUpdating(true)

    try {
      await apiRequest<{ locale: Locale }>("/api/preferences/locale", {
        method: "POST",
        body: { locale: nextLocale },
      })

      showToast({
        title: updatedMessage,
        variant: "info",
      })

      setIsOpen(false)
      router.refresh()
    } catch {
      showToast({
        title: errorMessage,
        variant: "error",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div ref={containerRef} className="language-switcher">
      <button
        type="button"
        className="language-switcher__icon-button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2Zm6.93 9h-3.12a15.8 15.8 0 0 0-1.07-5 8.05 8.05 0 0 1 4.19 5ZM12 4.06A13.56 13.56 0 0 1 13.9 11h-3.8A13.56 13.56 0 0 1 12 4.06ZM4.88 13h3.12a15.8 15.8 0 0 0 1.07 5 8.05 8.05 0 0 1-4.19-5Zm3.12-2H4.88a8.05 8.05 0 0 1 4.19-5A15.8 15.8 0 0 0 8 11Zm4 8.94A13.56 13.56 0 0 1 10.1 13h3.8A13.56 13.56 0 0 1 12 19.94ZM13.9 13a13.56 13.56 0 0 1-1.9 6.94A13.56 13.56 0 0 1 10.1 13Zm.84 5a15.8 15.8 0 0 0 1.07-5h3.12a8.05 8.05 0 0 1-4.19 5Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div className={`language-switcher__panel ${isOpen ? "language-switcher__panel--open" : ""}`}>
        <p>{label}</p>
        <button
          type="button"
          onClick={() => handleLocaleChange("es")}
          disabled={isUpdating || locale === "es"}
          className="language-switcher__option"
        >
          {spanishLabel}
        </button>
        <button
          type="button"
          onClick={() => handleLocaleChange("en")}
          disabled={isUpdating || locale === "en"}
          className="language-switcher__option"
        >
          {englishLabel}
        </button>
      </div>
    </div>
  )
}
