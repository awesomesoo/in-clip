-- 기존 분석 데이터에 대해 누락된 검색 기록 추가
-- 이 스크립트는 analysis 테이블에는 있지만 search_history에는 없는 분석들에 대해
-- 검색 기록을 자동으로 추가합니다.

INSERT INTO search_history (analysis_id, user_id, created_at)
SELECT 
    a.id as analysis_id,
    a.user_id,
    a.created_at
FROM analysis a
LEFT JOIN search_history sh ON a.id = sh.analysis_id AND a.user_id = sh.user_id
WHERE sh.id IS NULL  -- search_history에 없는 분석들만
  AND a.user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'  -- UUID 형식인 실제 사용자만 (anonymous- 제외)
;

-- 추가된 레코드 수 확인
SELECT 
    COUNT(*) as total_analyses,
    COUNT(DISTINCT sh.analysis_id) as analyses_with_history,
    COUNT(*) - COUNT(DISTINCT sh.analysis_id) as missing_history_count
FROM analysis a
LEFT JOIN search_history sh ON a.id = sh.analysis_id
WHERE a.user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'; 