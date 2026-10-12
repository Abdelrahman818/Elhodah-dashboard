'use client';

import { useEffect, useState } from "react";
import { Trash2, Edit, User, Loader2 } from "lucide-react";
import { endPoints } from "@/config";
import { toast } from "react-hot-toast";
import { adminFetch } from "@/lib/adminFetch";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editingUser, setEditingUser] = useState({ name: "", email: "", isAdmin: false });

  const fetchUsers = async () => {
    try {
      const res = await adminFetch(endPoints.users, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.successful) {
        setUsers(json.data);
      } else {
        toast.error(json.msg || "فشل تحميل المستخدمين");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchUsers);
  }, []);

  const handleEdit = (user) => {
    setEditingId(user._id);
    setEditingUser({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await adminFetch(`${endPoints.users}/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingUser),
      });
      const json = await res.json();
      if (json.successful) {
        toast.success("تم تحديث بيانات المستخدم");
        setUsers(users.map((u) => (u._id === editingId ? { ...u, ...editingUser } : u)));
        setEditingId(null);
      } else {
        toast.error(json.msg || "فشل التحديث");
      }
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      const res = await adminFetch(`${endPoints.users}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.successful) {
        toast.success("تم حذف المستخدم");
        setUsers(users.filter((u) => u._id !== id));
      } else {
        toast.error(json.msg || "فشل الحذف");
      }
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين</h1>

      <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-emerald-700" size={32} />
          </div>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">الاسم</th>
                <th className="py-2 px-4 text-left">البريد الإلكتروني</th>
                <th className="py-2 px-4 text-left">الصلاحية</th>
                <th className="py-2 px-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 flex items-center gap-2">
                    <User className="text-emerald-700" />
                    {editingId === user._id ? (
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, name: e.target.value })
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingId === user._id ? (
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, email: e.target.value })
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingId === user._id ? (
                      <select
                        value={editingUser.isAdmin ? "Admin" : "User"}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, isAdmin: e.target.value === "Admin" })
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      user.isAdmin ? "Admin" : "User"
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      {editingId === user._id ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition"
                          >
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition flex items-center gap-1 text-sm"
                          >
                            <Edit size={16} /> تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={16} /> حذف
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    لا يوجد مستخدمين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
