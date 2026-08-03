// 潘潘美甲美睫工作台 Service Worker - 已禁用缓存
const CACHE_NAME = 'panpan-v3-disabled';
const CACHE_FILES = [];

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  return;
});
