-- ============================================
-- 潘潘美甲美睫工作台 · Supabase 数据库初始化
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 创建数据存储表（键值对结构）
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- 启用行级安全
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在，避免重复创建报错）
DROP POLICY IF EXISTS "a1" ON kv_store;
DROP POLICY IF EXISTS "a2" ON kv_store;
DROP POLICY IF EXISTS "a3" ON kv_store;
DROP POLICY IF EXISTS "a4" ON kv_store;

-- 创建允许所有操作的策略（免费版简化权限）
CREATE POLICY "a1" ON kv_store FOR SELECT USING (true);
CREATE POLICY "a2" ON kv_store FOR INSERT WITH CHECK (true);
CREATE POLICY "a3" ON kv_store FOR UPDATE USING (true);
CREATE POLICY "a4" ON kv_store FOR DELETE USING (true);

-- 插入初始数据
INSERT INTO kv_store VALUES (
  'panpan_data',
  '{"rules":{"散客":0,"团购":0,"会员卡":0},"projects":[],"staff":[],"records":[],"appointments":[]}'::jsonb
) ON CONFLICT (key) DO NOTHING;
