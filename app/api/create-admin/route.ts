import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    let admin = await prisma.admin.findUnique({
      where: { email: 'admin@webcancban.com' }
    });

    if (!admin) {
      // Tạo admin user mới
      admin = await prisma.admin.create({
        data: {
          email: 'admin@webcancban.com',
          password: 'admin123',
          name: 'Administrator',
        },
      });
      
      return NextResponse.json({ 
        message: 'Admin user created successfully', 
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      });
    }

    return NextResponse.json({ 
      message: 'Admin user already exists', 
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    // Log chi tiết lỗi
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
