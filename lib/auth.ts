import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /**
       * Loại tài khoản.
       *
       * 'admin' = quản trị website (sản phẩm, tin tức, ảnh...).
       * 'scale' = khách hàng dùng phần cân điện tử.
       *
       * Phải ghi rõ trong phiên đăng nhập: nếu chỉ dựa vào id thì tài khoản
       * khách số 5 và quản trị viên số 5 trông giống hệt nhau, dẫn tới khách
       * vào được khu quản trị hoặc ngược lại.
       */
      kind?: 'admin' | 'scale';
    };
  }
  interface User {
    kind?: 'admin' | 'scale';
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email }
          });
          
          if (!admin) {
            return null;
          }
          
          const isHashed = /^\$2[aby]\$/.test(admin.password);

          if (isHashed) {
            const ok = await bcrypt.compare(credentials.password, admin.password);
            if (!ok) return null;
          } else {
            // Bản ghi cũ còn lưu mật khẩu thuần: so trực tiếp một lần cuối...
            if (admin.password !== credentials.password) return null;
            // ...rồi nâng cấp ngay sang bcrypt để lần sau không còn dạng thuần.
            try {
              const hashed = await bcrypt.hash(credentials.password, 10);
              await prisma.admin.update({
                where: { id: admin.id },
                data: { password: hashed },
              });
            } catch {
              // Không nâng cấp được thì vẫn cho đăng nhập, lần sau thử lại.
            }
          }

          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.name,
            kind: 'admin' as const,
          };
        } catch (error) {
          return null;
        }
      }
    }),

    /**
     * Đăng nhập cho KHÁCH HÀNG dùng phần cân điện tử.
     *
     * Tách hẳn khỏi provider quản trị ở trên: hai loại tài khoản nằm ở hai
     * bảng khác nhau, và phiên đăng nhập ghi rõ `kind` nên khách không thể
     * dùng tài khoản cân để vào khu quản trị website.
     *
     * Dự án gốc lưu thẳng số id vào cookie (`digital_scale_session = "5"`) —
     * khách chỉ cần sửa cookie thành "1" là đăng nhập thành người khác và đọc
     * hết dữ liệu của họ. Nay dùng NextAuth: phiên được ký, sửa là mất hiệu lực.
     */
    CredentialsProvider({
      id: 'scale',
      name: 'scale-user',
      credentials: {
        username: { label: 'Tên đăng nhập', type: 'text' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const user = await prisma.scaleUser.findUnique({
            where: { username: credentials.username.trim() },
          });

          // Tài khoản bị khoá coi như không tồn tại — không nói rõ lý do để
          // người lạ không dò được tên đăng nhập nào có thật.
          if (!user || !user.isActive) return null;

          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) return null;

          // Ghi lại lần đăng nhập để chủ shop biết tài khoản nào còn dùng thật.
          prisma.scaleUser
            .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            .catch(() => {
              /* Không ghi được thì vẫn cho đăng nhập bình thường. */
            });

          return {
            id: user.id.toString(),
            name: user.fullName,
            email: user.username,
            kind: 'scale' as const,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Ghi loại tài khoản vào token, nếu không thì mất sau lần tải trang đầu.
        token.kind = user.kind;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.kind = token.kind as 'admin' | 'scale' | undefined;
      }
      return session;
    },
  },
};
