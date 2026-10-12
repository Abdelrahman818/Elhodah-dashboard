"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Users, Box } from "lucide-react";
import { endPoints } from "@/config";
import { useUser } from "@/context/UserContext";
import { adminFetch } from "@/lib/adminFetch";

export default function AdminDashboard() {
  const { firebaseToken } = useUser();
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminFetch(endPoints.dashboard);

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await res.json();

        setStats([
          {
            name: "Orders",
            value: data.stats.orders,
            icon: <ShoppingCart className="text-white" />,
            bg: "bg-emerald-700",
          },
          {
            name: "Products",
            value: data.stats.products,
            icon: <Box className="text-white" />,
            bg: "bg-green-600",
          },
          {
            name: "Users",
            value: data.stats.users,
            icon: <Users className="text-white" />,
            bg: "bg-purple-600",
          },
        ]);

        setOrders(data.latestOrders || []);
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [firebaseToken]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">لوحة المعلومات</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex items-center p-6 bg-white rounded-xl shadow-md"
          >
            <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Orders Table */}
      <div className="mt-10 bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">أحدث الطلبات</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">لا توجد طلبات حالياً</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">رقم الطلب</th>
                <th className="py-2 px-4 text-left">العميل</th>
                <th className="py-2 px-4 text-left">الحالة</th>
                <th className="py-2 px-4 text-left">السعر</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-2 px-4">
                    #{order.orderId || order._id.slice(-5)}
                  </td>
                  <td className="py-2 px-4">
                    {order.user?.name || order.name || "—"}
                  </td>
                  <td
                    className={`py-2 px-4 font-medium ${order.orderStatus === "completed"
                      ? "text-green-600"
                      : order.orderStatus === "in delivery"
                        ? "text-yellow-600"
                        : order.orderStatus === "pending"
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                  >
                    {order.orderStatus}
                  </td>
                  <td className="py-2 px-4">
                    {order.totalPrice} جنيه
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
