"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { apiRequest } from "@app/shared/lib/api-client"
import { useToast } from "@app/shared/ui/toast-provider"

type LogoutButtonProps = {
  label: string
  successMessage: string
  errorMessage: string
}

export function LogoutButton({ label, successMessage, errorMessage }: LogoutButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogout() {
    try {
      setIsSubmitting(true)
      await apiRequest<{ success: boolean }>("/api/auth/logout", { method: "POST" })

      showToast({
        title: successMessage,
        variant: "success",
      })

      router.push("/login")
      router.refresh()
    } catch {
      showToast({
        title: errorMessage,
        variant: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button type="button" className="logout-button" onClick={handleLogout} disabled={isSubmitting}>
      {label}
    </button>
  )
}
