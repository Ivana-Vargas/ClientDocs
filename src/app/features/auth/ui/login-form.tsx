"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { ApiClientError, apiRequest } from "@app/shared/lib/api-client"
import { useToast } from "@app/shared/ui/toast-provider"
import { AlertModal } from "@app/shared/ui/alert-modal"

type LoginResponse = {
  accessToken: string
  user: {
    id: string
    email: string
    role: "admin" | "manager"
  }
}

type LoginFormLabels = {
  email: string
  password: string
  showPassword: string
  hidePassword: string
  submit: string
  submitting: string
  validationTitle: string
  validationDescription: string
  missingEmail: string
  missingPassword: string
  missingEmailAndPassword: string
  inlineInvalidCredentials: string
  successTitle: string
  successDescription: string
  serviceErrorTitle: string
  serviceUnavailable: string
  unexpectedError: string
  error401: string
  error401Description: string
  error400: string
  error400Description: string
  error500: string
  error500Description: string
  close: string
}

type LoginFormProps = {
  labels: LoginFormLabels
}

export function LoginForm({ labels }: LoginFormProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [inlineAuthError, setInlineAuthError] = useState<string | null>(null)
  const [emailFieldError, setEmailFieldError] = useState(false)
  const [passwordFieldError, setPasswordFieldError] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const submittedEmail = String(formData.get("email") ?? "").trim()
    const submittedPassword = String(formData.get("password") ?? "")
    const missingEmail = submittedEmail.length === 0
    const missingPassword = submittedPassword.trim().length === 0

    setEmailFieldError(missingEmail)
    setPasswordFieldError(missingPassword)

    if (missingEmail || missingPassword) {
      const validationDescription =
        missingEmail && missingPassword
          ? labels.missingEmailAndPassword
          : missingEmail
            ? labels.missingEmail
            : labels.missingPassword

      showToast({
        title: labels.validationTitle,
        description: validationDescription,
        variant: "error",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setInlineAuthError(null)
      setEmailFieldError(false)
      setPasswordFieldError(false)
      setEmail(submittedEmail)
      setPassword(submittedPassword)

      await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { email: submittedEmail, password: submittedPassword },
      })

      showToast({
        title: labels.successTitle,
        description: labels.successDescription,
        variant: "success",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      if (error instanceof ApiClientError) {
        const userMessage =
          error.status === 401
            ? labels.error401
            : error.status === 400
              ? labels.error400
              : labels.error500

        const userDescription =
          error.status === 401
            ? labels.error401Description
            : error.status === 400
              ? labels.error400Description
              : labels.error500Description

        showToast({
          title: userMessage,
          description: userDescription,
          variant: "error",
        })

        if (error.status === 401) {
          setInlineAuthError(labels.inlineInvalidCredentials)
        }

        if (error.status >= 500) {
          setModalMessage(labels.serviceUnavailable)
        }

        return
      }

      setModalMessage(labels.unexpectedError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">{labels.email}</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (emailFieldError) {
              setEmailFieldError(false)
            }
          }}
          className={emailFieldError ? "input--error" : undefined}
          aria-invalid={emailFieldError ? "true" : "false"}
        />

        <label htmlFor="password">{labels.password}</label>
        <div className="password-field">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (passwordFieldError) {
                setPasswordFieldError(false)
              }
              if (inlineAuthError) {
                setInlineAuthError(null)
              }
            }}
            className={passwordFieldError || inlineAuthError ? "input--error" : undefined}
            aria-invalid={passwordFieldError || inlineAuthError ? "true" : "false"}
          />
          <button
            type="button"
            className="password-visibility-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? labels.hidePassword : labels.showPassword}
            title={showPassword ? labels.hidePassword : labels.showPassword}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M3.5 5.5 18.5 20.5M10.6 9.2a3.2 3.2 0 0 1 4.2 4.2M7.8 7.8A14.2 14.2 0 0 1 12 7c6.1 0 9.8 5 10.8 6.7a1 1 0 0 1 0 1c-.5.9-1.8 2.8-4 4.3M5.3 10.3a14.4 14.4 0 0 0-4.1 3.4 1 1 0 0 0 0 1C2.2 16.4 5.9 21.4 12 21.4c1.5 0 2.9-.3 4.2-.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M1.2 12.7a1 1 0 0 1 0-1C2.2 10 5.9 5 12 5s9.8 5 10.8 6.7a1 1 0 0 1 0 1C21.8 14.4 18.1 19.4 12 19.4s-9.8-5-10.8-6.7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12.2" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        </div>
        {inlineAuthError ? <small className="input-error">{inlineAuthError}</small> : null}

        <button type="submit" className="login-submit-button" disabled={isSubmitting}>
          {isSubmitting ? labels.submitting : labels.submit}
        </button>
      </form>

      <AlertModal
        open={modalMessage !== null}
        title={labels.serviceErrorTitle}
        description={modalMessage ?? ""}
        closeLabel={labels.close}
        onClose={() => setModalMessage(null)}
      />
    </>
  )
}
