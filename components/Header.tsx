'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../src/lib/auth-context'

export default function Header() {
  const { user, loading, signOut, isSupabaseConfigured } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      // 로그아웃 후 홈페이지로 이동
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 오류:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  // 사용자 표시 이름 생성 함수
  const getUserDisplayName = () => {
    if (!user) return ''

    // Google 로그인 사용자인 경우 user_metadata에서 이름 가져오기
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }

    // 이름이 없으면 이메일에서 @ 앞부분 사용
    if (user.email) {
      return user.email.split('@')[0]
    }

    return '사용자'
  }

  // 아바타 이니셜 생성 함수
  const getUserInitial = () => {
    if (!user) return '?'

    // Google 로그인 사용자인 경우 이름의 첫 글자
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase()
    }

    // 이메일의 첫 글자
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }

    return '?'
  }

  return (
    <header className={`header ${isScrolled ? 'header-transparent' : ''}`}>
      <div className='container'>
        <div className='header-content'>
          {/* Logo */}
          <Link href='/' className='logo text-gradient'>
            InClip
          </Link>

          {/* Navigation */}
          <nav className='nav'>
            <Link href='/analyze' className='nav-link'>
              영상 요약하기
            </Link>
            <Link href='/feed' className='nav-link'>
              커뮤니티
            </Link>
            {user && (
              <Link href='/history' className='nav-link'>
                내 분석 기록
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className='user-actions'>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className='loading-spinner'></div>
              </div>
            ) : user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link href='/history' className='nav-link user-link-hidden'>
                  내 기록
                </Link>
                <Link href='/mypage' className='nav-link user-link-hidden'>
                  마이페이지
                </Link>
                <div className='user-avatar'>
                  <div className='avatar-circle'>{getUserInitial()}</div>
                  <span className='user-name user-name-hidden'>
                    {getUserDisplayName()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className='btn btn-secondary'
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link href='/login' className='btn btn-outline' style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  로그인
                </Link>
                <Link href='/signup' className='btn btn-primary' style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
