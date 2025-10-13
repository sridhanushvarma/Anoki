import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Anoki',
  description: 'Read the terms and conditions for using Anoki tools and services.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
