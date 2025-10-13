import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Anoki',
  description: 'Learn how Anoki collects, uses, and protects your personal information and data.',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
