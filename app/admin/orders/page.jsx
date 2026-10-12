'use client';

import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { endPoints } from "@/config";
import { toast } from "react-hot-toast";
import { adminFetch } from "@/lib/adminFetch";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = ["pending", "in delivery", "completed", "cancelled"];

  const fetchOrders = async () => {
    try {
      const res = await adminFetch(endPoints.orders, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.successful) {
        setOrders(json.data);
      } else {
        toast.error(json.msg || "فشل تحميل الطلبات");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchOrders);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await adminFetch(`${endPoints.orders}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const json = await res.json();
      if (json.successful) {
        toast.success("تم تحديث الحالة");
        setOrders(orders.map(o => o._id === id ? { ...o, orderStatus: newStatus } : o));
      } else {
        toast.error(json.msg || "فشل التحديث");
      }
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      const res = await adminFetch(`${endPoints.orders}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.successful) {
        toast.success("تم حذف الطلب");
        setOrders(orders.filter(o => o._id !== id));
      } else {
        toast.error(json.msg || "فشل الحذف");
      }
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "in delivery": return "text-emerald-700";
      case "completed": return "text-green-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">إدارة الطلبات</h1>

      <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-emerald-700" size={32} />
          </div>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">رقم الطلب</th>
                <th className="py-2 px-4 text-left">العميل</th>
                <th className="py-2 px-4 text-left">المنتجات</th>
                <th className="py-2 px-4 text-left">الإجمالي</th>
                <th className="py-2 px-4 text-left">الحالة</th>
                <th className="py-2 px-4 text-left">التاريخ</th>
                <th className="py-2 px-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">#{order.orderId || order._id.slice(-5)}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{order.user?.name || order.name}</span>
                      <span className="text-xs text-gray-500">{order.phone}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col gap-1">
                      {order.products?.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.product?.title || "منتج محذوف"} (x{item.quantity})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">{order.totalPrice} جنيه</td>
                  <td className={`py-2 px-4 font-medium`}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white ${statusColor(order.orderStatus)}`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 text-sm whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <Trash2 size={16} /> حذف
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    لا توجد طلبات حالياً
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
