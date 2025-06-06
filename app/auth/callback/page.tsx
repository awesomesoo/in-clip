'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          setError('Supabase가 설정되지 않았습니다.')
          setLoading(false)
          return
        }

        // URL에서 인증 코드를 처리
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError(`인증 오류: ${error.message}`)
        } else if (data.session) {
          // 인증 성공 - 메인 페이지로 리다이렉트
          setTimeout(() => {
            window.location.href = '/'
          }, 1500)
        } else {
          setError('인증 세션을 찾을 수 없습니다.')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('인증 처리 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [])

  if (loading) {
    return (
      <div
        className='section-padding bg-gray-50'
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <div className='container'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
              로그인 처리 중...
            </h2>
            <p className='text-gray-600'>잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className='section-padding bg-gray-50'
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        <div className='container'>
          <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
              로그인 실패
            </h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <div className='space-y-4'>
              <Link href='/login' className='btn btn-primary w-full'>
                다시 로그인하기
              </Link>
              <Link href='/' className='btn btn-secondary w-full'>
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className='section-padding bg-gray-50'
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <div className='container'>
        <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
            로그인 성공!
          </h2>
          <p className='text-gray-600 mb-6'>
            잠시 후 메인 페이지로 이동합니다.
          </p>
          <Link href='/' className='btn btn-primary w-full'>
            바로 이동하기
          </Link>
        </div>
      </div>
    </div>
  )
}
