'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading, isSupabaseConfigured } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && isSupabaseConfigured) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo, isSupabaseConfigured])

  // 로딩 중
  if (loading) {
    return (
      <div className='section-padding flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>인증 상태를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  // Supabase가 설정되지 않은 경우
  if (!isSupabaseConfigured) {
    return (
      <div className='section-padding flex items-center justify-center min-h-screen'>
        <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center'>
          <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-yellow-600'
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
            데모 모드
          </h2>
          <p className='text-gray-600 mb-6'>
            이 기능을 사용하려면 Supabase 프로젝트를 연결해야 합니다.
          </p>
          <div className='space-y-4'>
            <Link href='/test-env' className='btn btn-primary w-full'>
              설정 가이드 보기
            </Link>
            <Link href='/' className='btn btn-secondary w-full'>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className='section-padding flex items-center justify-center min-h-screen'>
        <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
            로그인이 필요합니다
          </h2>
          <p className='text-gray-600 mb-6'>
            이 페이지에 접근하려면 먼저 로그인해주세요.
          </p>
          <div className='space-y-4'>
            <Link href='/login' className='btn btn-primary w-full'>
              로그인하기
            </Link>
            <Link href='/signup' className='btn btn-secondary w-full'>
              회원가입하기
            </Link>
            <Link href='/' className='btn btn-outline w-full'>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return <>{children}</>
}
