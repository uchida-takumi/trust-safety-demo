const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.use(express.json())
app.set('view engine', 'pug')
const PORT = 3000

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('index')
})

/* -------------------------------------------------------------------------- */
/*                                 Ad serving                                 */
/* -------------------------------------------------------------------------- */

app.get('/ad', (req, res) => {
  /* 内田の解釈
  媒体社が設置した広告枠用のiframeタグ(以降で定義されている /ad-script) に表示する広告データを返却する
  */
  // 広告主のサーバーの画像ファイルがあるエンドポイントを設定
  const href = `${process.env.ADVERTISER_URL}/shoes07`
  // 広告をクリックした後の遷移先を指定
  const attributionDestination = process.env.ADVERTISER_URL
  // 広告主のWebサイトでコンバージョンが発生した時の、レポート先として自分のドメインを指定
  const attributionReportTo = process.env.ADTECH_URL
  // views/ad.pug をテンプレートとして、hrefなどのオブジェクトを渡してレンダリング
  /*
  views/ad.pug　内で、hrefなどのオブジェクトがどのように用いられているかを下記に記す。

  ``` views/ad.pug
  // 864000000 = 10 days in milliseconds
  a#ad(
    href=href 
    attributiondestination=attributiondestination 
    attributionsourceeventid='' 
    attributionreportto=attributionreportto 
    attributionexpiry='864000000' 
    target='_parent'
    )
    img(width='180' src='/shoes07.png' alt='shoes 07')
  ```

  上記のa#ad(href=href)は以下のようにhtmlにパースされる。(他のattributiondestination などは省略)
  
  ```
  <a id="ad" href="${process.env.ADVERTISER_URL}/shoes07">
  <img src='/shoes07.png' width='180' alt='shoes 07'>
  </a>
  ```

  断定はできないが、以下の<a>タグの属性（上記のhtmlパース結果では省略しているが）は
  Chrome:Privacy SandboxがCV計測処理に必要とする変数と考えられる。
    attributiondestination
    attributionsourceeventid
    attributionreportto
    attributionexpiry
  */
  res.render('ad', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-script', (req, res) => {
  // 返却(res)の　Content-Type を javascriptに設定
  res.set('Content-Type', 'text/javascript')
  //表示するディスプレイ広告のデータがあるエンドポイントURLを設定
  const adUrl = `${process.env.ADTECH_URL}/ad`
  // iframeタグの生成スクリプトを返却する
  res.send(
    `console.info('✔️ Adtech script loaded'); document.write("<iframe src='${adUrl}' allow='attribution-reporting' width=190 height=200 scrolling=no frameborder=1 padding=0></iframe>")`
  )
})

/* -------------------------------------------------------------------------- */
/*                     Attribution trigger (conversion)                       */
/* -------------------------------------------------------------------------- */
/*
 広告主のサイトでthanksページをブラウザが読み込んだ時に、
 広告主がそこに埋めた計測タグはアドテックサーバーの/conversionに対してconversion-typeを
 クエリパラメータで送信するはずである。

 この受け付けをするURLエンドポイント /conversion の処理定義が以下で行われる。
*/

const conversionValues = {
  signup: 1,
  checkout: 2
}

app.get('/conversion', (req, res) => {
  /* 
  　広告主のWebサイト上でthanksページが読み込まれた時に、
  　同時にアドテックのサーバーの/conversionにリクエストが送信される。 
  */
  // 広告主のWebサイトでクエリパラメータとして設定されたconversion-typeを受け取る。
  const attributionTriggerData = conversionValues[req.query['conversion-type']]

  // ブラウザからのconversion-typeを受け取った直後に、
  // アドテックサーバー（＝このプログラム）からブラウザ へ コンバージョンデータのリクエストを送る。
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech sends a conversion record request to the browser with conversion data = ${attributionTriggerData}`
  )
  // adtech orders the browser to schedule-send a report
  // アドテックサーバーはブラウザに対して、レポートのスケジュール送信を要求します。
  //　リダイレクト先として設定されている、`/.well-known/attr...`は実際には以下で定義されている、app.post('/*')を参照すると思われる。
  res.redirect(
    302, // 302リダイレクトのため、ブラウザを利用しているユーザーはリダイレクトに気が付きません。301なら恒久リダイレクトなので気が付きます。
    `/.well-known/attribution-reporting/trigger-attribution?trigger-data=${attributionTriggerData}`
  )
})

/* -------------------------------------------------------------------------- */
/*                                 Reports                                    */
/* -------------------------------------------------------------------------- */

let reports = []

app.get('/reports', (req, res) => {
  // reports を返却する
  res.send(JSON.stringify(reports))
})

app.post('/*', async (req, res) => {
  // コンバージョンの発生があるたびに、'/conversion'を経由して呼び出され、
  // reports にコンバージョンイベントが追加されていく。
  console.log('body', req.body)
  const newReport = { ...req.body, date: new Date() }
  reports = [newReport, ...reports]
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech has received a report from the browser`
  )
  res.sendStatus(200)
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech server is listening on port ${listener.address().port}`
  )
})
