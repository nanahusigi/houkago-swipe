/* 店内は電波が弱いことがあるので、一度開いたらオフラインでも動くようにする。
   アプリ本体はキャッシュ優先＋裏で更新、商品画像は見たものを永続キャッシュ。 */
const VER   = "kura-v1";
const SHELL = "shell-" + VER;
const IMGS  = "imgs-" + VER;
const APP   = ["./", "./index.html", "./menu.js", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.endsWith(VER)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // くら寿司の商品画像：一度読めたらキャッシュから出す
  if (/kurasushi\.co\.jp\/menu\/upload\//.test(req.url)) {
    e.respondWith(
      caches.open(IMGS).then(cache =>
        cache.match(req).then(hit => hit || fetch(req).then(res => {
          cache.put(req, res.clone()).catch(() => {});
          return res;
        }).catch(() => hit))
      )
    );
    return;
  }

  // アプリ本体：キャッシュを即返しつつ、裏で新しいものを取ってくる
  if (new URL(req.url).origin === location.origin) {
    e.respondWith(
      caches.open(SHELL).then(cache =>
        cache.match(req).then(hit => {
          const net = fetch(req).then(res => {
            if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
            return res;
          }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
});
