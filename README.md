# Maintenance Garage

車好き向けの個人用車両管理アプリのMVPです。

## 目的
- 給油記録の管理
- 燃費計算
- 整備履歴の管理
- LocalStorageでの保存
- スマホ前提の簡単なUI

## ファイル構成

```text
Maintenance_Garage/
├─ index.html
├─ styles.css
├─ app.js
├─ README.md
└─ .gitignore
```

## 役割
- `index.html`: 画面構成とHTML
- `styles.css`: スマホ向けレスポンシブCSS
- `app.js`: LocalStorage管理 / 燃費計算 / 履歴表示 / 部品追加

## 使い方
1. `index.html` をブラウザで開く
2. 「給油」タブで給油履歴を保存
3. 「整備」タブで部品交換を記録
4. 「履歴」タブで一覧を確認
5. 画面を更新してもデータはブラウザ内に保持されます

## 主要機能
- 給油履歴保存
- 前回給油との差分から燃費計算
- LocalStorage保存
- 部品追加でプルダウン更新
- 整備履歴一覧
- ホーム画面の集計表示

## 備考
- GitHub Pagesでの配信を想定
- JSのみで構成し、サーバー不要
- 将来PWA化やCSV出力も拡張可能
