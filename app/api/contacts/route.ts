import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/contacts - Lấy danh sách liên hệ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const [contacts, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactRequest.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Tạo liên hệ mới (từ form contact)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    const contact = await prisma.contactRequest.create({
      data: {
        name,
        phone,
        email,
        product: subject || '', // Map subject to product field in database
        message,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
