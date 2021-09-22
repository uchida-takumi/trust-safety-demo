const express = require('express');
// .env.* ファイルで環境変数を定義し、 dotenv で取り扱う。
// process.env.NODE_ENV はこのファイルを以下のように実行した場合に'development'が参照される
//   >> NODE_ENV=development node server.js
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const app = express()
// 使用するhtmlテンプレートファイルの形式としてpugファイルをセットする。
// テンプレートファイルはデフォルトでviews/ディレクトリにあるとみなされる。
app.set('view engine', 'pug')
const PORT = 8082

app.use(express.static('static'))

app.get('/shoes07', (req, res) => {
  res.render('shoes07')
})

app.get('/checkout', (req, res) => {
  // pass the conversion type to adtech - but more data could be passed e.g. the model purchased
  /*　内田の解釈
  (意訳した結果)
  adtechサーバー　に送るべきconversion type をブラウザに送ります。
  ここでは'checkout'だけだが、より多くのデータを送信できる。

  関数名からこれはthanksページをブラウザに返却する定義。
  
  (1) このコードは advertiser(広告主)のサーバーに実装するnode.jsである。
  (2) 出力となる res.render() の送信先は、ブラウザである。
  (3) このコード内には、ブラウザ以外の出力コードは存在しない。
    → よって、このコードブラウザに「このページはcheckoutというCVページだよ」という情報を送り、
    　その後、ブラウザがアドテックサーバーに転送すると想定される。
  */
  
  // conversion Type をテキストで定義
  const conversionType = 'checkout'
  // ブラウザに転送してもらうアドテックサーバーのエンドポイント(URL)のクエリパラメータのconversion Typeを設定
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  // アドテックサーバーのドメインを設定
  const adtechServerUi = `${process.env.ADTECH_URL}`
  /* 内田の解釈
   res.render()を実行することでブラウザに対してレンダリング（表示）したデータを返却する。
   res.render()の第一引数はhtmlテンプレートファイルを指定する。以下ではviews/checkout.pugとなる。
   この時、第二引数のadtechRequestUrl, adtechServerUiをchekout.pugに引き渡している。
     (1) adtechRequestUrl : conversion-typeをクエリパラメータにもつ、アドテックサーバーのエンドポイント
     (2) adtechServerUi : アドテックサーバーのドメイン
   views/chekout.pug 内では、この二つの引数を以下のように参照している。
     >> img.pixel(src=adtechRequestUrl height='12' width='12')
     >> a(href=adtechServerUi) adtech server UI
   上記のうち、コンバージョン計測に関わるのは、img.pixel()である。a()は表示用。
   img.pixel は pugの定義で、ブラウザに送信される際には以下のhtmlに変更される。
   (ここでは、説明のためにprocess.env.ADTECH_URL を 'https://adtech.com' と仮定する)
     <img 
      class="pixel" 
      src="https://adtech.com/conversion?conversion-type=checkout"
      height="12" width="12">
   なので、このimgタグをHTMLに挿入してもいい
   （ただし、アドテックサーバーがsrcの計測URLエンドポイントを用意している必要がある）
  */
  res.render('checkout', { adtechRequestUrl, adtechServerUi })
  /* 以下は内田の想像
  よって、Chrome:PrivacySandboxによる新しいコンバージョン計測機能の、
  広告主(advertiser)に求められる対応は、「Google広告のCVタグの再設置」であると想定される。

  これに加え、今までのCV計測と違い、以下のような仕様変更があることを周知する必要はある。
  　(1)コンバージョンの反映まで時間差がある。
  　(2)意図的に5%程度のランダム誤差が混入される。
  　(3)広告グループなど詳細な単位でコンバージョンが計測されなくなる？（要確認）

  広告主と媒体社で対応すべき仕様が異なることが想定される。
  そのため勉強会や納品方法などは、広告主/媒体社を分けて対応するほうが良いと思われる。
  */
})

app.get('/signup', (req, res) => {
  /* 内田の解釈
   上記の checkout とほぼ同じ
  */
  const conversionType = 'signup'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  const adtechServerUi = `${process.env.ADTECH_URL}`
  res.render('signup', { adtechRequestUrl, adtechServerUi })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  /* 内田の解釈
   即時実行関数で .env に指定したPORTでブラウザからのリクエストを待ち受け状態にする。
  */
   console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
