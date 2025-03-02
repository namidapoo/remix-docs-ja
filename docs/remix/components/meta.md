---
title: Meta
toc: false
---

# `<Meta />`

このコンポーネントは、ルートモジュールの [`meta`][meta] エクスポートによって作成されたすべての [`<meta>`][meta_element] タグをレンダリングします。通常は `app/root.tsx` のように、HTML の [`<head>`][head_element] 内にレンダリングする必要があります。

```tsx filename=app/root.tsx lines=[7]
import { Meta } from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body></body>
    </html>
  );
}
```

[meta_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
[head_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head
[meta]: ../route/meta

