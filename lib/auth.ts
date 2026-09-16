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
    };
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
          };
        } catch (error) {
          return null;
        }
      }
    })
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
