"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Upload, X } from "lucide-react";
import { endPoints } from "@/config";
import { toast } from "react-hot-toast";
import { getImageUrl } from "@/lib/imageUrl";
import { adminFetch } from "@/lib/adminFetch";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [editingImagePreview, setEditingImagePreview] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await adminFetch(endPoints.categories());
      const json = await res.json();

      if (json.successful) {
        setCategories(json.data);
      } else {
        setError(json.msg);
      }
    } catch (err) {
      setError("Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchCategories);
  }, []);

  // Handle Image Selection
  const handleImageChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isEditing) {
        setEditingImage(file);
        setEditingImagePreview(previewUrl);
      } else {
        setNewImage(file);
        setNewImagePreview(previewUrl);
      }
    }
  };

  // Add Category
  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    try {
      const formData = new FormData();
      formData.append("name", newCategory.trim());
      formData.append("status", "active"); // Default to active
      if (newImage) {
        formData.append("image", newImage);
      }

      const res = await adminFetch(endPoints.categories(), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const json = await res.json();

      if (json.successful) {
        setCategories([...categories, json.data]);
        setNewCategory("");
        setNewImage(null);
        setNewImagePreview(null);
        // Refresh to get the correct image URL format if needed, or just rely on the response
        fetchCategories();
        toast.success("Category added successfully");
      } else {
        toast.error(json.msg || "Failed to add category");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  // Start Editing
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
    setEditingImage(null);
    setEditingImagePreview(null);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingImage(null);
    setEditingImagePreview(null);
  };

  // Update Category
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editingName);
      if (editingImage) {
        formData.append("image", editingImage);
      }

      const res = await adminFetch(endPoints.categories(`/${editingId}`), {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      const json = await res.json();

      if (json.successful) {
        setCategories(
          categories.map((cat) =>
            cat._id === editingId ? json.data : cat
          )
        );
        handleCancelEdit();
        fetchCategories(); // Refresh to ensure data consistency
        toast.success(json.cleanupPending
          ? "Category updated; Cloudinary cleanup is pending"
          : "Category updated successfully");
      } else {
        toast.error(json.msg || "Failed to update category");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  // Delete Category
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await adminFetch(endPoints.categories(`/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json();

      if (json.successful) {
        setCategories(categories.filter((cat) => cat._id !== id));
        toast.success(json.cleanupPending
          ? "Category deleted; Cloudinary cleanup is pending"
          : "Category deleted successfully");
      } else {
        toast.error(json.msg || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">إدارة التصنيفات</h1>

      {/* Add Category */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">أضف تصنيف جديد</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="اسم التصنيف"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="relative">
              <input
                type="file"
                id="new-cat-image"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageChange(e, false)}
              />
              <label
                htmlFor="new-cat-image"
                className="cursor-pointer flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition border border-gray-300"
              >
                <Upload size={16} />
                {newImage ? "تغيير الصورة" : "رفع صورة"}
              </label>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 bg-emerald-700 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition"
            >
              <Plus size={16} />
              إضافة
            </button>
          </div>

          {newImagePreview && (
            <div className="mt-2">
              <img
                src={newImagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 text-left">الصورة</th>
              <th className="py-2 px-4 text-left">الاسم</th>
              <th className="py-2 px-4 text-left">الحالة</th>
              <th className="py-2 px-4 text-left">عدد المنتجات</th>
              <th className="py-2 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  {editingId === cat._id ? (
                    <div className="flex flex-col gap-2">
                      <div className="relative w-16 h-16">
                        <img
                          src={editingImagePreview || (cat.imgUrl ? getImageUrl(cat.imgUrl, 96) : "/placeholder.png")}
                          alt={cat.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      </div>
                      <input
                        type="file"
                        id={`edit-cat-image-${cat._id}`}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageChange(e, true)}
                      />
                      <label
                        htmlFor={`edit-cat-image-${cat._id}`}
                        className="text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer text-center hover:bg-gray-200"
                      >
                        تغيير
                      </label>
                    </div>
                  ) : (
                    <img
                      src={cat.imgUrl ? getImageUrl(cat.imgUrl, 96) : "/placeholder.png"}
                      alt={cat.name}
                      className="w-12 h-12 object-cover rounded-lg border"
                      onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Image" }}
                    />
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === cat._id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cat.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {cat.productsCount || 0}
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    {editingId === cat._id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition text-sm"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition flex items-center gap-1 text-sm"
                        >
                          <Edit size={14} /> تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={14} /> حذف
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  لا توجد تصنيفات حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
