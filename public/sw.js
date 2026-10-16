self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// Financial data is never cached; requests always use the network.
self.addEventListener('fetch',()=>{});
