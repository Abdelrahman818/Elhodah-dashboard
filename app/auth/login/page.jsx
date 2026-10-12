"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { endPoints } from "@/config";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirebaseAuth } from "../../../firebaseConfig";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const syncWithBackend = async (token) => {
    try {
      const res = await fetch(endPoints.sync, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok || !data.successful) throw new Error(data.msg || "Unable to sync admin account");
    } catch (err) {
      console.error("Backend sync error:", err);
      throw err;
    }
  };

  const verifyAdmin = async (token) => {
    const response = await fetch(endPoints.getRole, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok || !result.successful || !result.isAdmin) {
      await signOut(getFirebaseAuth());
      throw new Error("This account is not authorized for administration");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("يرجى ملء جميع الحقول ❌");
      return;
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const token = await userCredential.user.getIdToken();
      await syncWithBackend(token);
      await verifyAdmin(token);

      toast.success("تم تسجيل دخول الإدارة بنجاح");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      try {
        await signOut(getFirebaseAuth());
      } catch (signOutError) {
        console.error("Unable to clear failed admin session:", signOutError);
      }
      console.error("Login error:", error);
      toast.error(error.message || "تعذر تسجيل الدخول بهذه الصلاحيات");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
        
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      await syncWithBackend(token);
      await verifyAdmin(token);

      toast.success("تم تسجيل دخول الإدارة بنجاح");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      try {
        await signOut(getFirebaseAuth());
      } catch (signOutError) {
        console.error("Unable to clear failed admin session:", signOutError);
      }
      console.error(`Google login error:`, error);
      toast.error(error.message || "فشل تسجيل الدخول بهذه الصلاحيات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          دخول الإدارة
        </h1>
        <p className="text-center text-gray-500 mb-8">
          تسجيل دخول مخصص لفريق الإدارة
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            name="email"
            value={form.email}
            placeholder=""
            onChange={handleChange}
          />

          <Input
            label="كلمة المرور"
            type="password"
            name="password"
            value={form.password}
            placeholder=""
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-700 text-white py-3 rounded-lg hover:bg-emerald-800 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو المتابعة عبر</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Google
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...props}
        required
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      />
    </div>
  );
}
