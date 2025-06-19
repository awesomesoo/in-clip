'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!supabase) {
        setMessage(
          'Supabase가 설정되지 않았습니다. SUPABASE_SETUP_GUIDE.md를 참조하세요.'
        )
        return
      }

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else if (data.user) {
        setMessage('로그인 성공!')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error) {
      setMessage('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage('')

    try {
      if (!supabase) {
        setMessage(
          'Supabase가 설정되지 않았습니다. SUPABASE_SETUP_GUIDE.md를 참조하세요.'
        )
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google login error:', error)
        setMessage(`구글 로그인 오류: ${error.message}`)
        setLoading(false)
      }
      // OAuth는 리다이렉트되므로 성공시 loading은 유지
    } catch (error) {
      console.error('Google login error:', error)
      setMessage('구글 로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div
      className='section-padding bg-gray-50'
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <div className='container'>
        <div className='form-container fadeIn'>
          <div className='text-center' style={{ marginBottom: '2rem' }}>
            <Link href='/' style={{ fontSize: '1.875rem', fontWeight: '700' }} className='text-gradient'>
              InClip
            </Link>
          </div>

          <h1 className='form-title'>로그인</h1>
          <p className='form-subtitle'>
            계정에 로그인하여 모든 기능을 이용하세요
          </p>

          {message && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid',
                borderRadius: '0.5rem',
                background: message.includes('성공') ? '#f0fdf4' : '#fef2f2',
                borderColor: message.includes('성공') ? '#bbf7d0' : '#fecaca'
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: message.includes('성공') ? '#15803d' : '#dc2626'
                }}
              >
                {message}
              </p>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className='btn btn-google'
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            <svg
              className='google-icon'
              viewBox='0 0 24 24'
              style={{ marginRight: '12px' }}
            >
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Google로 로그인
          </button>

          <div className='form-divider'>
            <span>또는</span>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin}>
            <div className='form-group'>
              <label htmlFor='email' className='form-label'>
                이메일
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='input'
                placeholder='your@email.com'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='password' className='form-label'>
                비밀번호
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='input'
                placeholder='비밀번호를 입력하세요'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='btn btn-primary'
              style={{ width: '100%', marginBottom: '1.5rem' }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className='text-center'>
            <p className='text-gray-600'>
              계정이 없으신가요?{' '}
              <Link href='/signup' className='form-link'>
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
