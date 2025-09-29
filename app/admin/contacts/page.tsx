'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableRow, TableCell } from '@/components/admin/Table';
import { Button } from '@/components/admin/FormComponents';
import { Mail, Phone, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  product: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setContacts(contacts.map(contact => 
          contact.id === id ? { ...contact, status } : contact
        ));
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContacts(contacts.filter(contact => contact.id !== id));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <MessageSquare className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    return contact.status === filter;
  });

  const statusCounts = {
    all: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    processing: contacts.filter(c => c.status === 'processing').length,
    resolved: contacts.filter(c => c.status === 'resolved').length,
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý liên hệ</h1>
          <p className="text-gray-600">Xem và phản hồi các liên hệ từ khách hàng</p>
        </div>

        {/* Filter tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'Tất cả', count: statusCounts.all },
              { key: 'new', label: 'Mới', count: statusCounts.new },
              { key: 'processing', label: 'Đang xử lý', count: statusCounts.processing },
              { key: 'resolved', label: 'Đã xử lý', count: statusCounts.resolved },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white shadow rounded-lg">
          <Table headers={['Khách hàng', 'Liên hệ', 'Sản phẩm quan tâm', 'Tin nhắn', 'Trạng thái', 'Ngày gửi', 'Thao tác']}>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="font-medium">{contact.name}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {contact.phone}
                    </div>
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {contact.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {contact.product || 'Không có'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm" title={contact.message}>
                    {contact.message || 'Không có tin nhắn'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {getStatusIcon(contact.status)}
                      <span className="ml-1">
                        {contact.status === 'new' && 'Mới'}
                        {contact.status === 'processing' && 'Đang xử lý'}
                        {contact.status === 'resolved' && 'Đã xử lý'}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <select
                      value={contact.status}
                      onChange={(e) => updateStatus(contact.id, e.target.value)}
                      className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="new">Mới</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="resolved">Đã xử lý</option>
                    </select>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">
                {filter === 'all' ? 'Chưa có liên hệ nào' : `Không có liên hệ ${filter === 'new' ? 'mới' : filter === 'processing' ? 'đang xử lý' : 'đã xử lý'}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
