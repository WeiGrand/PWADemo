### 运行本项目

```bash
npm install
npm run start
```

# 升级你的 WebApp 为 Progressive Web App

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



