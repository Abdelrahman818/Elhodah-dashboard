"use client";

import { useState } from "react";
import { Trash2, Mail } from "lucide-react";

export default function ContactAdmin() {
  const [contacts, setContacts] = useState([]);

  const handleDelete = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">إدارة رسائل العملاء</h1>

      <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 text-left">الاسم</th>
              <th className="py-2 px-4 text-left">البريد الإلكتروني</th>
              <th className="py-2 px-4 text-left">الرسالة</th>
              <th className="py-2 px-4 text-left">التاريخ</th>
              <th className="py-2 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 flex items-center gap-2">
                  <Mail className="text-emerald-700" /> {contact.name}
                </td>
                <td className="py-2 px-4">{contact.email}</td>
                <td className="py-2 px-4">{contact.message}</td>
                <td className="py-2 px-4">{contact.date}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                  >
                    <Trash2 size={16} /> حذف
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  لا توجد رسائل حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
