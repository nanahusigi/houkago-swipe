# メニューの更新方法

くら寿司はフェア商品が月1回くらい入れ替わる。`menu.js` を差し替えるだけで反映される。

## 手順

1. PCで https://www.kurasushi.co.jp/menu/ を開く
2. F12 → Console を開いて、下のスクリプトを丸ごと貼って実行
3. 出てきた文字列をコピーして、`menu.js` の `window.KURA_MENU = [ ... ];` の中身と入れ替える
4. `KURA_META.updated` の日付を今日に直す
5. `sw.js` の `const VER = "kura-v1"` を `kura-v2` のように上げる（上げないと古いキャッシュが残る）
6. commit して push

```js
copy(JSON.stringify([...document.querySelectorAll('.menu-item')].map(el=>{
  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  let n=el,cat='';
  while(n){
    if(n.previousElementSibling){
      n=n.previousElementSibling;
      const h=(n.matches&&n.matches('h2,h3,h4'))?n:(n.querySelector?n.querySelector('h2,h3'):null);
      if(h&&h.textContent.trim()){cat=norm(h.textContent);break;}
    } else { n=n.parentElement; }
  }
  const img=el.querySelector('img');
  const ps=el.querySelectorAll('.menu-summary li:first-child p');
  return {
    id:(el.id||'').replace('menu-',''),
    n:norm(el.querySelector('.menu-name')?.textContent),
    p:norm(ps[0]?.textContent),
    k:norm(ps[1]?.textContent),
    i:(img?.getAttribute('data-src')||img?.src||'').replace('/menu/upload/',''),
    c:cat
  };
}),null,0).replace(/^\[|\]$/g,'').replace(/\},\{/g,'},\n{'))
```

`copy()` はクリップボードに入る関数。実行後そのまま貼り付けられる。

## 注意

- 公式サイトが載せているのは **1皿115円〜店舗** の価格だけ。
  120円〜／130円〜／150円〜の店舗のメニューはPDFでしか配っていないので、このアプリには入れていない。
  該当店舗では「自由入力で追加」で対応する。
- 画像は公式サイトから直接読み込んでいる。公式が画像を差し替えるとリンクが切れるが、
  そのときはカードが 🍣 のプレースホルダーに変わるだけで、計算には影響しない。
- 商品IDは公式のHTMLに書かれている `menu-XXXXXX` をそのまま使っている。
