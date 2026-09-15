import { PrismaClient } from '@prisma/client'

/**
 * Prisma client dùng chung cho toàn ứng dụng.
 *
 * Vì sao phải tái dùng một instance:
 * Đo thực tế cho thấy truy vấn ĐẦU TIÊN trên một kết nối mới mất ~2.500ms,
 * trong khi các truy vấn sau chỉ ~280ms. Gần như toàn bộ chênh lệch là thời
 * gian bắt tay TLS + xác thực tới Neon (Postgres serverless đặt tại Mỹ).
 *
 * Nếu mỗi request tạo client mới, mọi khách truy cập đều phải trả cái giá 2,5
 * giây đó. Giữ một instance chung ở cả dev lẫn production để kết nối được tái
 * sử dụng (tiêu chí 7).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

// Giữ instance ở mọi môi trường. Bản trước chỉ gán khi KHÔNG phải production,
// nghĩa là trên server thật mỗi lần module được nạp lại sẽ tạo kết nối mới.
globalForPrisma.prisma = prisma
