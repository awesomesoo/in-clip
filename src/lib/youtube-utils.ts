import { YoutubeTranscript } from 'youtube-transcript'

export function extractVideoId(url: string): string {
    // YouTube URL 패턴들을 처리
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /^[a-zA-Z0-9_-]{11}$/ // 직접 비디오 ID가 입력된 경우
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
            return match[1]
        }
    }

    throw new Error('Invalid YouTube URL')
}

export async function getTranscript(videoId: string): Promise<string> {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'ko' // 한국어 자막 우선, 없으면 영어
        })

        if (!transcript || transcript.length === 0) {
            // 한국어 자막이 없으면 영어 시도
            const englishTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: 'en'
            })

            if (!englishTranscript || englishTranscript.length === 0) {
                throw new Error('Transcript not available')
            }

            return englishTranscript.map(item => item.text).join(' ')
        }

        return transcript.map(item => item.text).join(' ')
    } catch (error) {
        console.error('Error fetching transcript:', error)
        throw new Error('Transcript not available')
    }
} 