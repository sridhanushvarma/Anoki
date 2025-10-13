import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Anoki',
  description: 'Sign in to your Anoki account to access all tools and download processed files.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
