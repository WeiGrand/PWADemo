
# 升级你的 WebApp 为 Progressive Web App

### 运行本项目

```bash
npm install
npm run start
```

## Step1: 加入 manifest.json

在 `html` 文件中引入 `manifest.json`

```html
<link rel="manifest" href="/manifest.json">
```

编写 `manifest.json`

```javascript
{
  "name": "", //app 的全称
  "short_name": "", //app 在桌面显示的名字 （位于 icon 下）
  "start_url": "", //默认的开始页面
  "scope": ".", //配置哪些页面需要使用 pwa 的特性，一般都为 '.' （相对于 sw.js 所在路径）
  "display": "standalone", //让 web app 看起来像 standalone 的原生 app
  "background_color": "", //加载时的背景色
  "theme_color": "", //app 顶部的颜色 （一般为切换 app 的时候可以看到）
  "description": "", //描述
  "dir": "ltr", //阅读顺序 一般是左到右
  "lang": "zh-CN", //语言 多语言配置参考 https://developer.chrome.com/webstore/i18n
  "orientation": "portrait-primary", //屏幕默认的方向
  "icons": [ //在桌面显示的 icon，是一个存储不同尺寸的 icon 的数组
    {
      "src": "",
      "type": "",
      "sizes": ""
    }
  ]
}
```

添加完 `manifest.json` 如何测试 `manifest.json` 是否生效呢？

1. 可以在 `Chrome Devtool` 的 `Application->Manifest` 中查看是否配置成功![](http://olkiij9c9.bkt.clouddn.com/QQ20180406-134513@2x.png)


2. 手机打开本页面，尝试将本页面添加到桌面，看设置是否正常

   因为`ios11` 之前的 `safari` 并不支持 `manifest` 所以会得到以下报错

   ```bash
   "GET /apple-touch-icon-120x120-precomposed.png" "MobileSafari/604.1 CFNetwork/894 Darwin/17.4.0"
   "GET /apple-touch-icon-120x120-precomposed.png" Error (404): "Not found"
   ```

   解决的方法如下

   ```html
   <!-- ios safari 在不支持 manifest 的情况下使用以下标签 可以使 web app 更接近原生 -->
     <meta name="apple-mobile-web-app-capable" content="yes">
     <meta name="apple-mobile-web-app-status-bar-style" content="black">
     <meta name="apple-mobile-web-app-title" content="PWA相册">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-57x57.png" sizes="57x57">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-60x60.png" sizes="60x60">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-72x72.png" sizes="72x72">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-114x114.png" sizes="114x114">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-120x120.png" sizes="120x120">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-144x144.png" sizes="144x144">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-152x152.png" sizes="152x152">
     <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-180x180.png" sizes="180x180">
   ```

   最终效果如下

   ![](http://olkiij9c9.bkt.clouddn.com/IMG_0235%20%281%29.PNG?imageView2/2/w/200)![](http://olkiij9c9.bkt.clouddn.com/IMG_0237%20%281%29.PNG?imageView2/2/w/200)



### 参考链接

- <http://caniuse.com/#feat=web-app-manifest>
- <https://developer.mozilla.org/en-US/docs/Web/Manifest>
- <https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/>
- <https://developers.google.com/web/fundamentals/engage-and-retain/app-install-banners/>




## Step2: 加入 Service Worker

> https://zhuanlan.zhihu.com/p/27264234
>
> 浏览器一般有三类 web Worker：
>
> 1. Dedicated Worker：专用的 worker，只能被创建它的 JS 访问，创建它的页面关闭，它的生命周期就结束了。
> 2. Shared Worker：共享的 worker，可以被同一域名下的 JS 访问，关联的页面都关闭时，它的生命周期就结束了。
> 3. ServiceWorker：是事件驱动的 worker，生命周期与页面无关，关联页面未关闭时，它也可以退出，没有关联页面时，它也可以启动，

### Service Worker 的 `生命周期`

![](http://olkiij9c9.bkt.clouddn.com/Untitled%20Diagram.jpg)



### 注册 Service Worker

修改 `/public/src/app.js`

```javascript
if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js') //返回一个 Promise 对象
        .then(function() {
            console.log('sw registered!');
        })
}
```

> 除了在 `manifest.json` 中设置作用域 `scope` 还可以在注册方法中指定
>
> ```javascript
> navigator.serviceWorker
>         .register('/sw.js', {scope: '/'});
> ```

刷新页面

在 `Chrome Devtool` 的 `Application->Service Workers` 中可以查看到是否设置成功

![](http://olkiij9c9.bkt.clouddn.com/QQ20180406-153457@2x.png)

修改 `/public/sw.js`

```javascript
//self 是 service worker 的引用
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
});

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ...', event);
    return self.client().claim();
    //调用 client().claim() 来控制未受控制的客户端。若不手动调用该方法，sw 相关的事件（如果 fetch）将在下一次刷新页面的时候才触发
    //https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim
});
```

刷新页面

打开控制台可以看到，`activate` 事件并没有触发

```
[Service Worker] Installing Service Worker ... InstallEvent {isTrusted: true, type: "install", target: ServiceWorkerGlobalScope, currentTarget: ServiceWorkerGlobalScope, eventPhase: 2, …}
```

这是因为页面可能还在使用之前较旧的 `Service Worker` 而激活一个新的 `Service Worker` 存在一定的危险，所以浏览器阻止了这种事情的发生

要触发 `activate` 事件需要关掉 `webview` 然后重新打开

### Web Install Banner

为应用添加网络应用安装横幅

修改 `/public/src/app.js`

```javascript
...
//Web Install Banner
//beforeinstallprompt 在 install banner 弹窗之前触发 event.preventDefault()
//event.preventDefault() 可以阻止弹出
//event.prompt() 可以手动弹出
var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

//deferredPrompt.prompt();
```

测试 `install banner`

在 `Chrome Devtool` 的 `Application->Manifest` 中点击 `Add to homescreen` 即刻触发 `install banner` 弹出事件。

![](http://olkiij9c9.bkt.clouddn.com/QQ20180406-220049.png)



### 如何注销一个 Service Woker

```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
 for(let registration of registrations) {
  registration.unregister()
} })
```



### 参考链接

- <https://jakearchibald.github.io/isserviceworkerready/>
- <https://developers.google.com/web/tools/chrome-devtools/remote-debugging/>
- https://developers.google.com/web/fundamentals/app-install-banners/
- <https://developers.google.com/web/fundamentals/getting-started/primers/service-workers>




## Step3: 使用 Cache API 缓存浏览器请求

### add/addAll

`Cache` 接口提供缓存的 `Request` / `Response `对象对的存储机制，作为`ServiceWorker` 生命周期的一部分。

`key`: `Request`

`value`: `Response`

![](http://olkiij9c9.bkt.clouddn.com/cacheapi.jpg)

修改 `sw.js`

```javascript
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);

    //waitUntil 方法用于保证执行完 cache 的方法再进行 fetch 事件
    event.waitUntil(
        //Opens Cache objects
        caches.open('static') // cache的名字 （自定义）
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.add('/');
                cache.add('/src/index.html');
                cache.add('/src/js/app.js');
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if(response) { // response or null
                    return response;
                }else {
                    return fetch(event.request);
                }
            })
    );
});
```

然后重启页面，选择 `offline` 环境刷新后可以看到，`index.html` 和 `app.js` 已经被缓存并可以离线访问

![](http://olkiij9c9.bkt.clouddn.com/127.0.0.1_8080_%28iPhone%206_7_8%29.png)

打开 `控制台` 查看 `Cache Storage` 可以看到新增的 `static` 记录，和缓存的请求

![](http://olkiij9c9.bkt.clouddn.com/cache.img.png)



除了一个个 `add` 还可以使用 `addAll` 来一次性增加，下面使用 `addAll` 给剩余的请求加上缓存

```javascript
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);

    //waitUntil 方法用于保证执行完 cache 的方法再进行 fetch 事件
    event.waitUntil(
        //Opens Cache objects
        caches.open('static') // cache的名字 （自定义）
            .then(function(cache) {
                console.log('[Service Worker] Precaching App Shell');

                cache.addAll([
                    '/',
                    '/index.html',
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
```

再次重启页面，选择 `offline` 环境刷新后可以看到「几乎」所有请求都能被成功缓存了下来，还没被缓存的请求来自 `https://fonts.googleapis.com/icon?family=Material+Icons` 文件中的请求

```css
/* fallback */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v36/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
}
```

所以可以得一个结论就是，对于一个真实的应用不可能像上面那样手动一条一条请求加缓存，我们需要 `动态缓存`

### Dynamic Caching

之前在 `fetch` 事件中，如果检查到有缓存的 `request` 则返回缓存的 `response` ，否则用 `fetch` 发起请求，我们可以在这一步中，将之前没有被缓存的 `request` 缓存起来

```javascript
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if(response) { // response or null
                    return response;
                }else {
                    return fetch(event.request)
                        .then(function(res) {
                            caches.open('dynamic')
                                .then(function(cache) {
                                    cache.put(event.request.url, res.clone()); // response 只会被读一次然后重置为空，所以需要拷贝一份
                                    return res; // 记得将 response 返回，否则最终不返回任何东西
                                })
                        })
                }
            })
    );
});
```

> `add` 和 `put` 的区别是：`add` 接受一个 `url`，发出 `request` 并自动将 `response` 缓存下来，而 `put` 不发送 `request`，需要你手动将 `request` 和 `response` 对应起来。

再次重启页面，选择 `offline` 环境刷新后可以发现所有请求都被成功缓存，查看 `Cache Storage` 可以看到多了一个名为 `dynamic` 的缓存模块

### 更新缓存

现在给 `app.js` 加个 `log`

```javascript
console.log('app.js updated');
```

然后刷新页面，很显然新加的 `log` 并不会在 `控制台` 中出现，因为 `Service Worker` 仍返回旧的 `app.js`，那么，如何更新呢？

当代码更新时，可以新增一个缓存模块名为 `static-v2`

修改 `sw.js`

```javascript
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('static-v2') // 这里将 static 改为 static-v2
            .then(function(cache) {
                ...
            })
    );
});
```

重启页面，可以发现更新依然没生效，因为 `static` 还保留着旧的缓存，`caches.match` 并不知道哪份是新的，所以需要将旧的清掉

再次修改 `sw.js`

```javascript
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys() // ['static', 'static-v2', 'dynamic']
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if(key !== 'static-v2' && key !== 'dynamic') {
                        console.log('[Service Worker] Removing old cache ', key);
                        return caches.delete(key);
                    }
                }))
            })
    );

    return self.clients.claim();
});
```

再次重启页面，可以看到 `控制台` 出现了 `app.js updated`

### 参考链接

- https://developer.mozilla.org/en-US/docs/Web/API/Cache
- <https://jakearchibald.com/2014/offline-cookbook/#cache-persistence>
- <https://developer.mozilla.org/en/docs/Web/API/Service_Worker_API>
- <https://developers.google.com/web/fundamentals/getting-started/primers/service-workers>



## Step4: 为应用提供默认页面(Fallback Page) 

在 `离线` 的状态下点击左上角导航跳转到 `帮助页`，可以发现什么都看不到，因为现在并没有给这个页面加缓存，所以我们需要在某个页面没被缓存的情况下提供一个默认的页面

首先新建一个 `html `

```bash
touch public/offline.html
```

然后修改 `sw.js`

首先将 `offline.html` 缓存起来

```javascript
self.addEventListener('install', function(event) {
    ...
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        	...
            .then(function(cache) {
                cache.addAll([
                    ...,
                    'offline.html'
                ]);
            })
    );
});
```

在 `fetch` 失败的时候返回 `offline.html`

```javascript
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if(response) {
                    return response;
                }else {
                    return fetch(event.request)
                        .then(function(res) {
                        	...
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
```

然后重启页面（记得更新缓存名），再次访问 `帮助页` 可以看到 `offline.html`

![](http://olkiij9c9.bkt.clouddn.com/127.0.0.1_8080_help%28iPhone%206_7_8%29.png?imageView2/2/w/200)

上面的解决方式比较粗躁，因为请求的不管是不是 `html` 都返回这份 `html`（比如请求一份 `JSON` 数据的时候失败也是返回 `offline.html`）



