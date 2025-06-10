-- 유튜브 분석 결과를 저장하기 위한 컬럼 추가
-- analysis 테이블에 AI 분석 데이터를 저장할 수 있는 컬럼들을 추가합니다

ALTER TABLE analysis 
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS key_points JSONB,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS sentiment TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS duration_estimate TEXT,
ADD COLUMN IF NOT EXISTS ai_tags JSONB;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_analysis_video_id ON analysis(video_id);
CREATE INDEX IF NOT EXISTS idx_analysis_category ON analysis(category);
CREATE INDEX IF NOT EXISTS idx_analysis_sentiment ON analysis(sentiment);

-- 컬럼 설명
COMMENT ON COLUMN analysis.video_id IS '유튜브 비디오 ID';
COMMENT ON COLUMN analysis.thumbnail_url IS '비디오 썸네일 URL';
COMMENT ON COLUMN analysis.transcript IS '추출된 자막 텍스트';
COMMENT ON COLUMN analysis.ai_summary IS 'AI가 생성한 요약';
COMMENT ON COLUMN analysis.key_points IS 'AI가 추출한 주요 포인트들 (JSON 배열)';
COMMENT ON COLUMN analysis.category IS 'AI가 분류한 카테고리';
COMMENT ON COLUMN analysis.sentiment IS 'AI가 분석한 감정 (긍정적, 부정적, 중립적)';
COMMENT ON COLUMN analysis.difficulty IS 'AI가 판단한 난이도 (초급, 중급, 고급)';
COMMENT ON COLUMN analysis.duration_estimate IS 'AI가 추정한 시청 시간';
COMMENT ON COLUMN analysis.ai_tags IS 'AI가 생성한 태그들 (JSON 배열)';

-- 예시 데이터 업데이트 (기존 샘플 데이터가 있다면)
UPDATE analysis 
SET 
    video_id = CASE 
        WHEN youtube_url LIKE '%watch?v=%' THEN SUBSTRING(youtube_url FROM 'watch\?v=([^&]+)')
        WHEN youtube_url LIKE '%youtu.be/%' THEN SUBSTRING(youtube_url FROM 'youtu\.be/([^?]+)')
        ELSE NULL
    END,
    thumbnail_url = CASE 
        WHEN youtube_url LIKE '%watch?v=%' THEN 'https://img.youtube.com/vi/' || SUBSTRING(youtube_url FROM 'watch\?v=([^&]+)') || '/hqdefault.jpg'
        WHEN youtube_url LIKE '%youtu.be/%' THEN 'https://img.youtube.com/vi/' || SUBSTRING(youtube_url FROM 'youtu\.be/([^?]+)') || '/hqdefault.jpg'
        ELSE NULL
    END,
    ai_summary = COALESCE(description, '요약 내용이 없습니다.'),
    key_points = '["주요 포인트 1", "주요 포인트 2", "주요 포인트 3"]'::jsonb,
    category = '교육',
    sentiment = '중립적',
    difficulty = '중급',
    duration_estimate = '10-15분',
    ai_tags = '["React", "프론트엔드", "JavaScript"]'::jsonb
WHERE video_id IS NULL OR ai_summary IS NULL; 