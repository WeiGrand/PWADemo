/**
 * Created by heweiguang on 2018/4/6.
 */

//self 是 service worker 的引用
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
});

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ...', event);
    return self.clients.claim();
    //调用 client.claim() 来控制未受控制的客户端。若不手动调用该方法，sw 相关的事件（如果 fetch）将在下一次刷新页面的时候才触发
    //https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim
});

self.addEventListener('fetch', function(event) {
    // event.respondWith(null);
});
