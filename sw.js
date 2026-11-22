const CACHE = 'samam-dollar-order-v15';
const FONT_URL = 'https://cdn.jsdelivr.net/gh/artbijan/Web-Font@main/BNazaninBold.woff2';
const FILES = ['./', './index.html', './samam-v11.html', './samam-v12.html', './samam-v13.html', './samam-v14.html', './samam-v15.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(async c=>{
    await c.addAll(FILES);
    try { await c.add(new Request(FONT_URL,{mode:'cors'})); } catch (_) { /* font is optional on first offline launch */ }
  }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('samam-dollar-order-') && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=>{
  const url=new URL(event.request.url);
  if(event.request.url === FONT_URL){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(async response=>{
      if(response.ok){const copy=response.clone();const cache=await caches.open(CACHE);await cache.put(event.request,copy);}
      return response;
    })));
    return;
  }
  if(url.origin!==self.location.origin || event.request.method!=='GET')return;
  // Prefer the published latest page when online; use the cached copy offline.
  event.respondWith(fetch(event.request, {cache: event.request.mode==='navigate' ? 'no-store' : 'no-cache'}).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}
    return response;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true})));
});
