var deferredPrompt;

if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js?t=1c') //返回一个 Promise 对象
        .then(function() {
            console.log('sw registered!');
        })
}

//Web Install Banner
window.addEventListener('beforeinstallprompt', function(event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});
