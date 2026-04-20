import type { Metadata } from "next"
import type { ReactNode } from "react"
import { cookies } from "next/headers"

import { ToastProvider } from "@app/shared/ui/toast-provider"
import { LOCALE_COOKIE_NAME, resolveLocale } from "@shared/localization/config"

import "./globals.css"

export const metadata: Metadata = {
  title: "ClientDocs",
  description: "Secure client document manager",
}

type RootLayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)

  return (
    <html lang={locale}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
