import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Anoki',
  description: 'Get in touch with the Anoki team. Send us your questions, feedback, or support requests.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
