import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Cân điện tử',
    description: 'Cân điện tử chính xác cho mọi mục đích sử dụng',
    icon: 'ri-scales-line',
    image: 'https://readdy.ai/api/search-image?query=professional%20digital%20electronic%20scale%20with%20LCD%20display%20on%20clean%20white%20background%2C%20precision%20weighing%20equipment%2C%20modern%20design%20with%20blue%20accents&width=400&height=300&seq=cat-1&orientation=landscape'
  },
  {
    name: 'Cân kỹ thuật',
    description: 'Cân kỹ thuật độ chính xác cao cho phòng thí nghiệm',
    icon: 'ri-flask-line',
    image: 'https://readdy.ai/api/search-image?query=precision%20analytical%20balance%20laboratory%20scale%20with%20glass%20chamber%20and%20digital%20display%2C%20high%20accuracy%20technical%20scale%2C%20scientific%20equipment%20white%20background&width=400&height=300&seq=cat-2&orientation=landscape'
  },
  {
    name: 'Cân bàn điện tử',
    description: 'Cân bàn điện tử tiện lợi cho cửa hàng, văn phòng',
    icon: 'ri-table-line',
    image: 'https://readdy.ai/api/search-image?query=table%20top%20digital%20scale%20with%20stainless%20steel%20platform%20and%20LED%20display%2C%20commercial%20weighing%20scale%20for%20retail%20shops%2C%20clean%20white%20background%20with%20blue%20details&width=400&height=300&seq=cat-3&orientation=landscape'
  },
  {
    name: 'Cân sàn điện tử',
    description: 'Cân sàn công nghiệp chịu tải trọng lớn',
    icon: 'ri-building-2-line',
    image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20industrial%20floor%20scale%20platform%20with%20digital%20indicator%2C%20warehouse%20weighing%20equipment%2C%20stainless%20steel%20platform%2C%20professional%20industrial%20setting&width=400&height=300&seq=cat-4&orientation=landscape'
  },
  {
    name: 'Cân ô tô',
    description: 'Cân ô tô, cân xe tải chính xác và bền bỉ',
    icon: 'ri-truck-line',
    image: 'https://readdy.ai/api/search-image?query=truck%20weighbridge%20scale%20system%20for%20heavy%20vehicles%2C%20industrial%20truck%20scale%20with%20concrete%20platform%20and%20digital%20control%20house%2C%20professional%20weighing%20facility&width=400&height=300&seq=cat-5&orientation=landscape'
  },
  {
    name: 'Cân treo móc cẩu',
    description: 'Cân treo, cân móc cẩu an toàn và chính xác',
    icon: 'ri-hammer-line',
    image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20crane%20scale%20hanging%20hook%20scale%20with%20digital%20display%2C%20industrial%20lifting%20weighing%20equipment%2C%20robust%20metal%20construction%2C%20professional%20warehouse%20setting&width=400&height=300&seq=cat-6&orientation=landscape'
  }
];

const products = [
  {
    name: 'Cân điện tử ACS-30',
    category: 'Cân điện tử',
    capacity: '30kg',
    accuracy: '1g',
    price: '2,500,000',
    featured: true,
    image: 'https://readdy.ai/api/search-image?query=professional%20digital%20scale%20ACS-30%20model%20with%20stainless%20steel%20platform%20and%20bright%20LCD%20display%2C%20commercial%20weighing%20equipment%2C%20white%20background%20with%20blue%20accents&width=300&height=250&seq=prod-1&orientation=landscape'
  },
  {
    name: 'Cân kỹ thuật FA-210',
    category: 'Cân kỹ thuật',
    capacity: '210g',
    accuracy: '0.1mg',
    price: '15,800,000',
    featured: true,
    image: 'https://readdy.ai/api/search-image?query=precision%20analytical%20balance%20FA-210%20with%20glass%20windshield%20chamber%2C%20laboratory%20scale%20with%20high%20accuracy%20display%2C%20scientific%20equipment%20on%20white%20background&width=300&height=250&seq=prod-2&orientation=landscape'
  },
  {
    name: 'Cân sàn 1 tấn',
    category: 'Cân sàn điện tử',
    capacity: '1000kg',
    accuracy: '200g',
    price: '12,000,000',
    featured: true,
    image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20industrial%20floor%20scale%20platform%201%20ton%20capacity%20with%20digital%20indicator%2C%20stainless%20steel%20weighing%20platform%2C%20warehouse%20equipment%20setting&width=300&height=250&seq=prod-3&orientation=landscape'
  },
  {
    name: 'Cân móc cẩu 5 tấn',
    category: 'Cân treo móc cẩu',
    capacity: '5000kg',
    accuracy: '2kg',
    price: '18,500,000',
    featured: true,
    image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20crane%20hook%20scale%205%20ton%20capacity%20with%20wireless%20remote%20display%2C%20industrial%20lifting%20weighing%20equipment%2C%20robust%20steel%20construction&width=300&height=250&seq=prod-4&orientation=landscape'
  }
];

async function main() {
  console.log('Start seeding...');

  // Tạo categories
  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    });
    createdCategories.push(created);
    console.log(`Created category: ${created.name}`);
  }

  // Tạo products
  for (const product of products) {
    const category = createdCategories.find(c => c.name === product.category);
    if (category) {
      const created = await prisma.product.create({
        data: {
          name: product.name,
          capacity: product.capacity,
          accuracy: product.accuracy,
          price: product.price,
          featured: product.featured,
          image: product.image,
          categoryId: category.id,
        },
      });
      console.log(`Created product: ${created.name}`);
    }
  }

  // Tạo admin user mặc định
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@webcancban.com',
      password: 'admin123', // Trong thực tế nên hash password
      name: 'Administrator',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
