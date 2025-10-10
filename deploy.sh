#!/bin/bash

echo "🚀 お化け屋敷整理券システムをデプロイします..."

# ビルド
echo "📦 ビルド中..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ ビルド成功"
else
    echo "❌ ビルド失敗"
    exit 1
fi

# Gitにコミット
echo "📝 Gitにコミット中..."
git add .
git commit -m "Deploy: $(date)"

# GitHubにプッシュ
echo "📤 GitHubにプッシュ中..."
git push origin main

echo "🎉 デプロイ完了！"
echo ""
echo "📱 次の手順でVercelにデプロイしてください："
echo "1. https://vercel.com にアクセス"
echo "2. GitHubアカウントでログイン"
echo "3. 'New Project'をクリック"
echo "4. このリポジトリを選択"
echo "5. デプロイ設定を確認して'Deploy'をクリック"
echo ""
echo "🌐 デプロイ後は以下のURLでアクセスできます："
echo "   https://[your-domain].vercel.app" 