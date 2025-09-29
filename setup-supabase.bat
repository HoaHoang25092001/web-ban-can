@echo off
echo ========================================
echo    SETUP SUPABASE DATABASE SCRIPT
echo ========================================
echo.

echo ⚠️  QUAN TRỌNG: Trước khi chạy script này:
echo    1. Tạo Supabase project tại https://supabase.com
echo    2. Cập nhật file .env với thông tin Supabase
echo    3. Đảm bảo DATABASE_URL đã được thay thế đúng
echo.

pause

echo 📝 Step 1: Generate Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to generate Prisma client
    echo � Check if DATABASE_URL in .env is correct
    pause
    exit /b 1
)

echo.
echo �🗄️ Step 2: Push schema to Supabase...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to push schema to database
    echo 💡 Check your internet connection and DATABASE_URL
    pause
    exit /b 1
)

echo.
echo 🌱 Step 3: Seed database with sample data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to seed database
    echo 💡 Database connection might be wrong
    pause
    exit /b 1
)

echo.
echo ✅ SETUP HOÀN THÀNH! Bạn có thể:
echo    👉 Chạy website: npm run dev (hoặc npx next dev -p 3001)
echo    👉 Truy cập: http://localhost:3001
echo    👉 Admin: http://localhost:3001/admin/login
echo    👉 Login: admin@webcancban.com / admin123
echo.
echo 🛠️ Tùy chọn: Chạy 'npm run db:studio' để xem database
echo.
pause
