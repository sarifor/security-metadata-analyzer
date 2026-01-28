# Security Metadata Analyzer <!-- omit in toc -->

## 目次 <!-- omit in toc -->

- [紹介](#紹介)
- [作成のきっかけ](#作成のきっかけ)
- [主な機能](#主な機能)
- [デモ動画](#デモ動画)
- [技術スタック](#技術スタック)
  - [開発環境](#開発環境)
  - [フロントエンド](#フロントエンド)
  - [バックエンド](#バックエンド)
  - [AIモデル](#aiモデル)
- [セットアップ・実行方法](#セットアップ実行方法)
  - [前提条件](#前提条件)
  - [インストール](#インストール)
  - [apikey.jsファイルを作成](#apikeyjsファイルを作成)
  - [アプリケーションを起動](#アプリケーションを起動)

## 紹介

本アプリは、監視カメラのメタデータを基に、特定期間において通常と異なる傾向が見られる時間帯を抽出します。</br>
擬似メタデータを用いた実装検証を目的としています。

## 作成のきっかけ

監視カメラSDKから取得したメタデータをAI SDKに渡し、</br>
分析結果を画面に表示するまでの一連の流れが実装として成立するかを検証してみたいと考え、本デモを作成しました。

## 主な機能
| 機能名 | 説明 |
|--------|------|
| 📥 メタデータ取得 | 監視カメラSDKから取得されることを想定した擬似メタデータをサーバー経由で読み込み、画面に表示します。 |
| 🤖 メタデータ分析 | 取得したメタデータをAIに渡し、複数日分のデータを比較して通常と異なる傾向が見られる時間帯を要約表示します。 |

## デモ動画
本デモの実際の動作を確認できる動画です。  
[デモ動画を見る](https://youtu.be/hpTULGBCiOM)


## 技術スタック

### 開発環境
- Windows 11

### フロントエンド
- HTML
- JavaScript

### バックエンド
- Node.js v20.18.3
- Express.js v5.2.1

### AIモデル
- Google Gemini 2.5 Flash


## セットアップ・実行方法

### 前提条件
- Node.jsがインストールされていること

### インストール
```bash
git clone https://github.com/sarifor/security-metadata-analyzer.git
cd security-metadata-analyzer
npm install
```
### apikey.jsファイルを作成
```javascript
// プロジェクト直下に apikey.js を作成
export const GEMINI_API_KEY = "YOUR_API_KEY";
```
### アプリケーションを起動
- サーバー
```bash
node server.js
```
- クライアント</br>
Webブラウザで main.html を直接開いてください。</br>
※サーバー側で `Access-Control-Allow-Origin: *` を設定しているため、Live Server なしでも CORS エラーは発生しません。