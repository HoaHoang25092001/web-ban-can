#!/bin/bash

echo "🔧 Setting up Supabase database..."

echo "📝 Step 1: Generate Prisma client..."
npm run db:generate

echo "🗄️ Step 2: Push schema to Supabase..."
npx prisma db push

echo "🌱 Step 3: Seed database with sample data..."
npm run db:seed

echo "✅ Setup complete! You can now:"
echo "   - Run: npm run dev"
echo "   - Visit: http://localhost:3001"
echo "   - Admin: http://localhost:3001/admin/login"
echo "   - Login: admin@webcancban.com / admin123"

echo "🛠️ Optional: Run 'npm run db:studio' to view database"
