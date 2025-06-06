'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const { user, loading, isSupabaseConfigured } = useAuth()
  const [connectionTest, setConnectionTest] = useState<string>('')

  useEffect(() => {
    const testConnection = async () => {
      if (!supabase) {
        setConnectionTest('❌ Supabase 클라이언트가 초기화되지 않았습니다.')
        return
      }

      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setConnectionTest(`❌ 연결 오류: ${error.message}`)
        } else {
          setConnectionTest('✅ Supabase 연결 성공')
        }
      } catch (error) {
        setConnectionTest(`❌ 연결 테스트 실패: ${error}`)
      }
    }

    testConnection()
  }, [])

  const isValidUrl =
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseUrl !== 'your_supabase_project_url_here'
  const isValidKey =
    supabaseAnonKey &&
    supabaseAnonKey.length > 10 &&
    supabaseAnonKey !== 'your_supabase_anon_key_here'

  return (
    <div className='section-padding'>
      <div className='container max-w-4xl'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gradient mb-4'>
            환경 변수 테스트
          </h1>
          <p className='text-gray-600'>
            Supabase 연결 상태와 환경 변수 설정을 확인합니다.
          </p>
        </div>

        <div className='grid gap-6'>
          {/* 환경 변수 상태 */}
          <div className='card'>
            <h2 className='text-xl font-semibold mb-4'>환경 변수 상태</h2>
            <div className='space-y-4'>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
                <div
                  className={`mt-2 p-3 rounded ${
                    isValidUrl
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {supabaseUrl || '설정되지 않음'}
                  <div className='text-sm mt-1'>
                    {isValidUrl ? '✅ 유효한 URL' : '❌ 유효하지 않은 URL'}
                  </div>
                </div>
              </div>

              <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
                <div
                  className={`mt-2 p-3 rounded ${
                    isValidKey
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {supabaseAnonKey
                    ? `${supabaseAnonKey.substring(0, 20)}...`
                    : '설정되지 않음'}
                  <div className='text-sm mt-1'>
                    {isValidKey ? '✅ 유효한 키' : '❌ 유효하지 않은 키'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 연결 상태 */}
          <div className='card'>
            <h2 className='text-xl font-semibold mb-4'>연결 상태</h2>
            <div className='space-y-4'>
              <div>
                <strong>Supabase 클라이언트:</strong>
                <p
                  className={`mt-2 p-3 rounded ${
                    isSupabaseConfigured
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  {isSupabaseConfigured ? '✅ 설정됨' : '⚠️ 데모 모드'}
                </p>
              </div>

              <div>
                <strong>연결 테스트:</strong>
                <p className='mt-2 p-3 rounded bg-gray-50 border'>
                  {connectionTest || '테스트 중...'}
                </p>
              </div>

              <div>
                <strong>인증 상태:</strong>
                <p className='mt-2 p-3 rounded bg-gray-50 border'>
                  {loading
                    ? '확인 중...'
                    : user
                    ? `✅ 로그인됨: ${user.email}`
                    : '❌ 로그인되지 않음'}
                </p>
              </div>
            </div>
          </div>

          {/* 설정 가이드 */}
          {!isSupabaseConfigured && (
            <div className='card bg-blue-50 border-blue-200'>
              <h2 className='text-xl font-semibold mb-4 text-blue-800'>
                Supabase 설정 가이드
              </h2>
              <div className='space-y-4 text-blue-700'>
                <p>실제 Supabase 프로젝트를 연결하려면 다음 단계를 따르세요:</p>
                <ol className='list-decimal list-inside space-y-2'>
                  <li>
                    프로젝트 루트에{' '}
                    <code className='bg-blue-100 px-1 rounded'>.env.local</code>{' '}
                    파일을 생성합니다.
                  </li>
                  <li>
                    Supabase 대시보드에서 프로젝트 URL과 anon key를 복사합니다.
                  </li>
                  <li>환경 변수를 설정합니다.</li>
                  <li>서버를 재시작합니다.</li>
                </ol>
                <div className='mt-4'>
                  <Link
                    href='/SUPABASE_SETUP_GUIDE.md'
                    className='btn btn-primary btn-sm'
                    target='_blank'
                  >
                    📖 자세한 설정 가이드 보기
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 테스트 액션 */}
          <div className='card'>
            <h2 className='text-xl font-semibold mb-4'>테스트 액션</h2>
            <div className='flex gap-4 flex-wrap'>
              <Link href='/login' className='btn btn-primary'>
                로그인 테스트
              </Link>
              <Link href='/signup' className='btn btn-secondary'>
                회원가입 테스트
              </Link>
              {user && (
                <Link href='/analyze' className='btn btn-accent'>
                  영상 분석 테스트
                </Link>
              )}
            </div>
          </div>

          {/* 환경 변수 예시 */}
          <div className='card bg-gray-50'>
            <h2 className='text-xl font-semibold mb-4'>.env.local 파일 예시</h2>
            <pre className='bg-black text-green-400 p-4 rounded text-sm overflow-x-auto'>
              {`# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 구글 OAuth 설정 (선택사항)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
