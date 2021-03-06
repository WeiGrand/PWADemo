/**
 * Created by heweiguang on 2018/4/6.
 */

var CACHE_STATIC_NAME = 'static-v5', CACHE_DYNAMIC_NAME = 'dynamic-v3';

//self 是 service worker 的引用
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);

    //waitUntil 方法用于保证执行完 cache 的方法再进行 fetch 事件
    event.waitUntil(
        //Opens Cache objects
        caches.open(CACHE_STATIC_NAME) // cache的名字 （自定义）
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');

                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys() // ['static', 'static-v2', 'dynamic']
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache ', key);
                        return caches.delete(key);
                    }
                }))
            })
    );

    return self.clients.claim();
    //调用 clients.claim() 来控制未受控制的客户端。若不手动调用该方法，sw 相关的事件（如果 fetch）将在下一次刷新页面的时候才触发
    //https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if(response) { // response or null
                    return response;
                }else {
                    return fetch(event.request)
                        .then(function(res) {
                            caches.open(CACHE_DYNAMIC_NAME)
                                .then(function(cache) {
                                    cache.put(event.request.url, res.clone()); // response 只会被读一次然后重置为空，所以需要拷贝一份
                                    return res; // 记得将 response 返回，否则最终不返回任何东西
                                })
                        })
                        .catch(function(err) {
                            return caches.open(CACHE_STATIC_NAME)
                                .then(function(cache) {
                                    return cache.match('/offline.html')
                                })
                        });
                }
            })
    );
});
