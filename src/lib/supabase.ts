import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            folders: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            summaries: {
                Row: {
                    id: string;
                    user_id: string;
                    folder_id: string | null;
                    video_url: string;
                    video_title: string;
                    summary: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    folder_id?: string | null;
                    video_url: string;
                    video_title: string;
                    summary: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    folder_id?: string | null;
                    video_url?: string;
                    video_title?: string;
                    summary?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}; 