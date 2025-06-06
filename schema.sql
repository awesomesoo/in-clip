-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS search_history;
DROP TABLE IF EXISTS analysis_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS analysis;

-- Analysis table
CREATE TABLE analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    user_description TEXT, -- 로그인 사용자의 개인 설명 (예: "대학 강의 정리용")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Tag table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- AnalysisTag junction table
CREATE TABLE analysis_tags (
    analysis_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_id, tag_id),
    CONSTRAINT fk_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES analysis(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);

-- SearchHistory table
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES analysis(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_analysis_user_id ON analysis(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_analysis_tags_analysis_id ON analysis_tags(analysis_id);
CREATE INDEX idx_analysis_tags_tag_id ON analysis_tags(tag_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for analysis table
CREATE TRIGGER update_analysis_updated_at
    BEFORE UPDATE ON analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
-- Note: You need to replace these UUIDs with actual user IDs from your auth.users table
-- First, let's get a real user ID from auth.users
DO $$
DECLARE
    real_user_id UUID;
    analysis1_id UUID;
    analysis2_id UUID;
    tag1_id UUID;
    tag2_id UUID;
    tag3_id UUID;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO real_user_id 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF real_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table. Please create a user first.';
    END IF;

    -- Insert sample analyses with user descriptions
    INSERT INTO analysis (youtube_url, title, description, user_description, user_id)
    VALUES 
        ('https://youtube.com/watch?v=sample1', 'React 18 새로운 기능 소개', 'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.', '대학 강의 정리용', real_user_id)
    RETURNING id INTO analysis1_id;

    INSERT INTO analysis (youtube_url, title, description, user_description, user_id)
    VALUES 
        ('https://youtube.com/watch?v=sample2', 'TypeScript 타입 시스템 완벽 가이드', 'TypeScript의 타입 시스템에 대한 심층 분석입니다.', '프로젝트 참고자료', real_user_id)
    RETURNING id INTO analysis2_id;

    -- Insert sample tags one by one
    INSERT INTO tags (name, user_id)
    VALUES ('프론트엔드', real_user_id)
    RETURNING id INTO tag1_id;

    INSERT INTO tags (name, user_id)
    VALUES ('React', real_user_id)
    RETURNING id INTO tag2_id;

    INSERT INTO tags (name, user_id)
    VALUES ('TypeScript', real_user_id)
    RETURNING id INTO tag3_id;

    -- Link analyses with tags
    INSERT INTO analysis_tags (analysis_id, tag_id)
    VALUES 
        (analysis1_id, tag1_id),
        (analysis1_id, tag2_id),
        (analysis2_id, tag1_id),
        (analysis2_id, tag3_id);

    -- Insert sample search history
    INSERT INTO search_history (analysis_id, user_id)
    VALUES 
        (analysis1_id, real_user_id),
        (analysis2_id, real_user_id);
END $$; 