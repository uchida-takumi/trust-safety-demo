const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8081

app.use(express.static('static'))

app.get('/', (req, res) => {
  /* 内田解釈
  アドテックサーバーのドメイン/ad-script のURLエンドポイントをadScriptUrlとして指定し、
  それを views/index.pug に反映させてから、ブラウザに対してレンダリングして送信している。

  この adScriptUrl は、アドテック側が予め用意しておかなければならないエンドポイントであり、
  index.pug内で以下のように参照されていることから、広告枠用のiframeタグと想定される。

  ```　views/index.pug
    // Third-party adtech script that dynamically creates an iframe with an ad
    script(src=adScriptUrl)
  ```

  上記のpugコードによって、レンダリングされるhtmlは以下となる。
   (ここでは、説明のためにprocess.env.ADTECH_URL を 'https://adtech.com' と仮定する)
  >> <script src="https://adtech.com/ad-script">

  よって、アドテックサーバーは https://adtech.com/ad-script に広告枠を表示するiframeタグを設定しておかなければならない。
  この https://adtech.com/ad-script の返却内容は ../adtech/server.js 内に以下のように定義されている。

  ``` ../adtech/server.js
    app.get('/ad-script', (req, res) => {
      // 返却(res)の　Content-Type を javascriptに設定
      res.set('Content-Type', 'text/javascript')
      const adUrl = `${process.env.ADTECH_URL}/ad`
      res.send(
        `console.info('✔️ Adtech script loaded'); document.write("<iframe src='${adUrl}' allow='attribution-reporting' width=190 height=200 scrolling=no frameborder=1 padding=0></iframe>")`
      )
    })
  ```





  */
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script`
  res.render('index', { adScriptUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;32m%s\x1b[0m',
    `📰 Publisher server is listening on port ${listener.address().port}`
  )
})
