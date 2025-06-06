-- Analysis 테이블에 user_description 컬럼 추가 (컬럼이 없는 경우만)
DO $$
BEGIN
    -- user_description 컬럼이 존재하지 않는 경우에만 추가
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'analysis' 
        AND column_name = 'user_description'
    ) THEN
        ALTER TABLE analysis ADD COLUMN user_description TEXT;
        RAISE NOTICE 'user_description 컬럼이 analysis 테이블에 추가되었습니다.';
    ELSE
        RAISE NOTICE 'user_description 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 스키마 캐시 새로고침을 위해 테이블 정보 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'analysis' 
ORDER BY ordinal_position; 