フロントエンドとバックエンドのサーバーを起動してください。

## 使用ポート（変更禁止）
| サービス | ポート |
|---------|--------|
| DB（PostgreSQL / Docker） | 5433 |
| バックエンド（Spring Boot） | 8080 |
| フロントエンド（Vite + React） | 5173 |

## 起動順序（厳守）

```
① DB（Docker）→ ② バックエンド → ③ フロントエンド
```

DBが起動していない状態でバックエンドを起動するとPostgreSQL接続エラーで落ちる。
必ずこの順序で起動すること。

## 起動手順

### ① DB（PostgreSQL）
```
docker compose up -d
```
- プロジェクトルートで実行
- コンテナ名: `taskmanagement-db`

### ② バックエンド（Spring Boot）
DBの起動を確認してから実行する。
- ディレクトリ: `backend/`
- コマンド: `./gradlew bootRun`
- URL: http://localhost:8080
- 起動完了の目安: `Started TaskmanagementApplication` のログ

### ③ フロントエンド（Vite + React）
- ディレクトリ: `frontend/`
- コマンド: `npm run dev`
- URL: http://localhost:5173
- 起動完了の目安: `VITE ready` のログ

## 起動前のポート競合チェック（必須）
起動前に以下を実行し、競合プロセスがあれば停止してから起動する。

```bash
# 競合確認
netstat -ano | findstr ":8080 "
netstat -ano | findstr ":5173 "

# 競合PIDを停止（Windowsの場合）
taskkill /PID <PID> /F
```

```bash
# Mac/Linux
lsof -ti:8080 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

## ポート競合ルール（厳守）
- ポートが競合した場合は、**既存プロセスを必ず停止**してから起動する
- 別のポートで代替起動することは禁止（フロント↔バックエンド間のURL設定が壊れるため）
- 必ずデフォルトポート（5433 / 8080 / 5173）で起動すること

すべて起動し、完了を確認してからユーザーに報告してください。
