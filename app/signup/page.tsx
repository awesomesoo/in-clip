'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const { isSupabaseConfigured } = useAuth()
  const router = useRouter()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('비밀번호는 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    try {
      if (!supabase) {
        setMessage(
          'Supabase가 설정되지 않았습니다. SUPABASE_SETUP_GUIDE.md를 참조하세요.'
        )
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setSuccess(true)
        setMessage('이메일을 확인하여 계정을 활성화해주세요.')
      }
    } catch (error) {
      setMessage('회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
        console.error('Google signup error:', error)
        setMessage(`구글 회원가입 오류: ${error.message}`)
        setLoading(false)
      }
    } catch (error) {
      console.error('Google signup error:', error)
      setMessage('구글 회원가입 중 오류가 발생했습니다.')
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
          <div className='text-center mb-8'>
            <Link href='/' className='text-3xl font-bold text-gradient'>
              InClip
            </Link>
          </div>

          <h1 className='form-title'>회원가입</h1>
          <p className='form-subtitle'>
            InClip에 가입하여 모든 기능을 이용하세요
          </p>

          {message && (
            <div
              className={`p-4 mb-6 border rounded-lg ${
                success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <p
                className={`text-sm ${
                  success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {!success && (
            <>
              {/* Google Signup Button */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className='btn btn-google w-full mb-6'
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
                Google로 회원가입
              </button>

              <div className='form-divider'>
                <span>또는</span>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleEmailSignup}>
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
                    placeholder='6자 이상 입력하세요'
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='confirmPassword' className='form-label'>
                    비밀번호 확인
                  </label>
                  <input
                    id='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='input'
                    placeholder='비밀번호를 다시 입력하세요'
                    required
                  />
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='btn btn-primary w-full mb-6'
                >
                  {loading ? '회원가입 중...' : '회원가입'}
                </button>
              </form>
            </>
          )}

          <div className='text-center'>
            <p className='text-gray-600'>
              이미 계정이 있으신가요?{' '}
              <Link href='/login' className='form-link'>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
