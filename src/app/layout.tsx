import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import CommandButton from '@/components/CommandButton'
import { BASE_PATH } from './constants'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anoki - Your Ultimate Tools Collection',
  description: 'A one-stop-shop for accessing popular AI tools, file converters, detectors, editors, and enhancers.',
  icons: {
    icon: `${BASE_PATH}/images/anoki-logo-light.jpg`,
    apple: `${BASE_PATH}/images/anoki-logo-light.jpg`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <CommandButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
