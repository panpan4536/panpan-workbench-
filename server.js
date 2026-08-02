/**
 * 潘潘美甲美睫工作台 - 后端服务
 * Express + Supabase
 */

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ 配置 ============
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const DATA_KEY = 'panpan_data';
const BOSS_PWD = process.env.BOSS_PWD || '0911';

// ============ 中间件 ============
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ Supabase 工具函数 ============
async function supabaseRequest(method, body) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase 未配置');
  }
  const url = `${SUPABASE_URL}/rest/v1/kv_store?key=eq.${DATA_KEY}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=representation'
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase 错误: ${res.status} ${txt}`);
  }
  return res.json();
}

async function loadData() {
  try {
    const data = await supabaseRequest('GET', null);
    if (data && data.length > 0) {
      return data[0].value;
    }
    return null;
  } catch (e) {
    console.error('读取数据失败:', e.message);
    return null;
  }
}

async function saveData(data) {
  try {
    // 先尝试 UPDATE
    const updateRes = await supabaseRequest('PATCH', { value: data });
    if (updateRes && updateRes.length > 0) {
      return true;
    }
    // 如果没有更新到行，尝试 INSERT (UPSERT)
    await supabaseRequest('POST', { key: DATA_KEY, value: data });
    return true;
  } catch (e) {
    console.error('保存数据失败:', e.message);
    return false;
  }
}

// ============ 路由 ============

// 健康检查
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 读取数据
app.get('/api/data', async (req, res) => {
  const data = await loadData();
  if (data === null) {
    return res.json({
      rules: { '散客': 0, '团购': 0, '会员卡': 0 },
      projects: [],
      staff: [],
      records: [],
      appointments: []
    });
  }
  res.json(data);
});

// 保存数据
app.post('/api/data', async (req, res) => {
  const ok = await saveData(req.body);
  res.json({ success: ok });
});

// 验证老板密码
app.post('/api/verify-boss', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === BOSS_PWD });
});

// 导出完整数据
app.post('/api/export-full', async (req, res) => {
  const { bossPassword } = req.body;
  if (bossPassword !== BOSS_PWD) {
    return res.status(403).json({ error: '密码错误' });
  }
  const data = await loadData();
  res.json({ data });
});

// 导入完整数据
app.post('/api/import-full', async (req, res) => {
  const { data, bossPassword } = req.body;
  if (bossPassword !== BOSS_PWD) {
    return res.status(403).json({ error: '密码错误' });
  }
  const ok = await saveData(data);
  res.json({ success: ok });
});

// 导出对账数据
app.post('/api/export-report', async (req, res) => {
  const { bossPassword, startDate, endDate } = req.body;
  if (bossPassword !== BOSS_PWD) {
    return res.status(403).json({ error: '密码错误' });
  }
  const data = await loadData();
  const records = (data.records || []).filter(r => {
    if (!r.date) return true;
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });
  res.json({ records, staff: data.staff || [], projects: data.projects || [], rules: data.rules || {} });
});

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`潘潘美甲美睫工作台运行在端口 ${PORT}`);
});
