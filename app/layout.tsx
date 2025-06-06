import type { Metadata } from 'next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AuthProvider } from '../src/lib/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'InClip - 긴 영상, 짧게 읽다',
  description: 'YouTube 영상 링크를 붙여넣고, InClip이 핵심만 요약해드립니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ko'>
      <body>
        <AuthProvider>
          <Header />
          <main className='fadeIn'>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
