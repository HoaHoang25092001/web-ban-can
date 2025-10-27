'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableRow, TableCell } from '@/components/admin/Table';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface News {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const toast = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; newsId: number | null }>({
    isOpen: false,
    newsId: null,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ isOpen: true, newsId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.newsId;
    if (!id) return;

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNews(news.filter(item => item.id !== id));
        toast.success('Xóa thành công!', 'Tin tức đã được xóa');
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể xóa tin tức');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Có lỗi xảy ra', 'Không thể kết nối đến server');
    } finally {
      setDeleteConfirm({ isOpen: false, newsId: null });
    }
  };

  const togglePublished = async (id: number, published: boolean) => {
    try {
      const newsItem = news.find(n => n.id === id);
      if (!newsItem) return;

      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newsItem,
          published: !published,
        }),
      });

      if (response.ok) {
        setNews(news.map(n => 
          n.id === id ? { ...n, published: !published } : n
        ));
      }
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h1>
            <p className="text-gray-600">Quản lý tất cả tin tức và bài viết</p>
          </div>
          <Link href="/admin/news/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Viết tin tức mới
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <Table headers={['Hình ảnh', 'Tiêu đề', 'Tóm tắt', 'Trạng thái', 'Ngày tạo', 'Thao tác']}>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-12 w-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No img</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium max-w-xs truncate" title={item.title}>
                    {item.title}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500 max-w-xs truncate" title={item.excerpt}>
                    {item.excerpt || 'Không có tóm tắt'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePublished(item.id, item.published)}
                      className={`${item.published ? 'text-green-600' : 'text-gray-400'} hover:text-green-700`}
                      title={item.published ? 'Ẩn bài viết' : 'Hiện bài viết'}
                    >
                      {item.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.published ? 'Đã xuất bản' : 'Nháp'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/news/edit/${item.id}`}>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {news.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">Chưa có tin tức nào</div>
              <Link href="/admin/news/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Viết tin tức đầu tiên
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa tin tức này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, newsId: null })}
        variant="danger"
      />
    </AdminLayout>
  );
}
