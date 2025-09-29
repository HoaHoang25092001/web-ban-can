const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Count records
    const categoryCount = await prisma.category.count();
    console.log(`📊 Categories count: ${categoryCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`📦 Products count: ${productCount}`);
    
    // Test 3: Fetch featured products (same as API)
    const featuredProducts = await prisma.product.findMany({
      where: {
        featured: true,
      },
      include: {
        category: true,
      },
      take: 5,
    });
    
    console.log(`⭐ Featured products count: ${featuredProducts.length}`);
    console.log('Featured products:', featuredProducts.map(p => ({ id: p.id, name: p.name, category: p.category.name })));
    
    // Test 4: Test categories
    const categories = await prisma.category.findMany({
      take: 3,
    });
    console.log(`📂 Sample categories: ${categories.length}`);
    console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name })));
    
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

testDatabase();