"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Upload, X } from "lucide-react";
import { endPoints } from "@/config";
import { toast } from "react-hot-toast";
import { getImageUrl } from "@/lib/imageUrl";
import { adminFetch } from "@/lib/adminFetch";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "",
    desc: "",
    sizes: "",
    colors: "",
    isFeatured: false,
  });
  const [newImages, setNewImages] = useState([]);
  const [newImagesPreview, setNewImagesPreview] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingImages, setEditingImages] = useState([]);
  const [editingImagesPreview, setEditingImagesPreview] = useState([]);
  const [replacementImage, setReplacementImage] = useState(null);
  const [replacementImageIndex, setReplacementImageIndex] = useState(null);

  // Fetch products and categories
  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        adminFetch(endPoints.products),
        adminFetch(endPoints.categories())
      ]);

      const productsJson = await productsRes.json();
      const categoriesJson = await categoriesRes.json();

      if (productsJson.successful) {
        setProducts(productsJson.data);
      }
      if (categoriesJson.successful) {
        setCategories(categoriesJson.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, []);

  // Handle Image Selection
  const handleImageChange = (e, isEditing = false) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const previews = files.map(file => URL.createObjectURL(file));
      if (isEditing) {
        setEditingImages([...editingImages, ...files]);
        setEditingImagesPreview([...editingImagesPreview, ...previews]);
      } else {
        setNewImages([...newImages, ...files]);
        setNewImagesPreview([...newImagesPreview, ...previews]);
      }
    }
  };

  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);

    const updatedPreviews = [...newImagesPreview];
    updatedPreviews.splice(index, 1);
    setNewImagesPreview(updatedPreviews);
  };

  const removeEditingImage = (index) => {
    URL.revokeObjectURL(editingImagesPreview[index]);
    const updatedImages = [...editingImages];
    updatedImages.splice(index, 1);
    setEditingImages(updatedImages);

    const updatedPreviews = [...editingImagesPreview];
    updatedPreviews.splice(index, 1);
    setEditingImagesPreview(updatedPreviews);
  };

  const handleReplacementImageChange = (event, index) => {
    const file = event.target.files?.[0];
    if (file) {
      setReplacementImage(file);
      setReplacementImageIndex(index);
    }
  };

  const handleDeleteImage = async (productId, index) => {
    if (!confirm("Are you sure you want to delete this product image?")) return;

    try {
      const response = await adminFetch(`${endPoints.products}/${productId}/images/${index}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await response.json();
      if (!json.successful) {
        toast.error(json.msg || "Failed to delete product image");
        return;
      }

      setProducts((current) => current.map((product) => (
        product._id === productId ? json.data : product
      )));
      if (editingId === productId) {
        setEditingProduct((current) => ({ ...current, ...json.data }));
        if (replacementImageIndex === index) {
          setReplacementImage(null);
          setReplacementImageIndex(null);
        } else if (replacementImageIndex > index) {
          setReplacementImageIndex(replacementImageIndex - 1);
        }
      }
      toast.success(json.cleanupPending
        ? "Image removed; Cloudinary cleanup is pending"
        : "Image deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  // Add Product
  const handleAdd = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newProduct.title);
      formData.append("price", newProduct.price);
      formData.append("category", newProduct.category);
      formData.append("desc", newProduct.desc || "");
      formData.append("isFeatured", newProduct.isFeatured);

      // Handle arrays for sizes and colors
      const sizesArray = newProduct.sizes ? newProduct.sizes.split(",").map(s => s.trim()) : [];
      const colorsArray = newProduct.colors ? newProduct.colors.split(",").map(c => c.trim()) : [];

      formData.append("sizes", JSON.stringify(sizesArray));
      formData.append("colors", JSON.stringify(colorsArray));

      newImages.forEach((image) => {
        formData.append("images", image);
      });

      const res = await adminFetch(endPoints.products, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const json = await res.json();

      if (json.successful) {
        setNewProduct({
          title: "",
          price: "",
          category: "",
          desc: "",
          sizes: "",
          colors: "",
          isFeatured: false,
        });
        setNewImages([]);
        setNewImagesPreview([]);
        fetchData(); // Refresh list
        toast.success("Product added successfully");
      } else {
        toast.error(json.msg || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  // Start Editing
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditingProduct({
      ...product,
      sizes: Array.isArray(product.size) ? product.size.join(", ") : product.size,
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : product.colors,
    });
    setEditingImages([]);
    setEditingImagesPreview([]);
    setReplacementImage(null);
    setReplacementImageIndex(null);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    editingImagesPreview.forEach((preview) => URL.revokeObjectURL(preview));
    setEditingId(null);
    setEditingProduct(null);
    setEditingImages([]);
    setEditingImagesPreview([]);
    setReplacementImage(null);
    setReplacementImageIndex(null);
  };

  // Update Product
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editingProduct.title);
      formData.append("price", editingProduct.price);
      formData.append("category", editingProduct.category);
      formData.append("desc", editingProduct.desc || "");
      formData.append("isFeatured", editingProduct.isFeatured);

      // Handle arrays for sizes and colors
      const sizesArray = editingProduct.sizes ? editingProduct.sizes.split(",").map(s => s.trim()) : [];
      const colorsArray = editingProduct.colors ? editingProduct.colors.split(",").map(c => c.trim()) : [];

      formData.append("sizes", JSON.stringify(sizesArray));
      formData.append("colors", JSON.stringify(colorsArray));

      if (replacementImage) {
        formData.append("replaceImageIndex", replacementImageIndex);
        formData.append("images", replacementImage);
      }
      editingImages.forEach((image) => {
        formData.append("images", image);
      });

      const res = await adminFetch(endPoints.products + `/${editingId}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      const json = await res.json();

      if (json.successful) {
        handleCancelEdit();
        fetchData(); // Refresh list
        toast.success(json.cleanupPending
          ? "Product updated; Cloudinary cleanup is pending"
          : "Product updated successfully");
      } else {
        toast.error(json.msg || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await adminFetch(endPoints.products + `/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json();

      if (json.successful) {
        setProducts(products.filter((p) => p._id !== id));
        toast.success(json.cleanupPending
          ? "Product deleted; Cloudinary cleanup is pending"
          : "Product deleted successfully");
      } else {
        toast.error(json.msg || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">إدارة المنتجات</h1>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">أضف منتج جديد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="اسم المنتج"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="السعر"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          >
            <option value="">اختر التصنيف</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="المقاسات (مفصولة بفاصلة)"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            value={newProduct.sizes}
            onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
          />
          <input
            type="text"
            placeholder="الألوان (مفصولة بفاصلة)"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            value={newProduct.colors}
            onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={newProduct.isFeatured}
              onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="isFeatured">منتج مميز</label>
          </div>
        </div>
        <textarea
          placeholder="وصف المنتج"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={newProduct.desc}
          onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })}
          rows="3"
        ></textarea>

        <div className="mb-4">
          <div className="relative inline-block">
            <input
              type="file"
              id="new-prod-images"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handleImageChange(e, false)}
            />
            <label
              htmlFor="new-prod-images"
              className="cursor-pointer flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition border border-gray-300"
            >
              <Upload size={16} />
              رفع صور
            </label>
          </div>

          {newImagesPreview.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {newImagesPreview.map((src, index) => (
                <div key={index} className="relative shrink-0">
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition"
        >
          <Plus size={16} />
          إضافة المنتج
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 text-left">الصورة</th>
              <th className="py-2 px-4 text-left">الاسم</th>
              <th className="py-2 px-4 text-left">السعر</th>
              <th className="py-2 px-4 text-left">التصنيف</th>
              <th className="py-2 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  {prod.images && prod.images.length > 0 ? (
                    <img
                      src={getImageUrl(prod.images[0], 96)}
                      alt={prod.title}
                      className="w-12 h-12 object-cover rounded-lg border"
                      onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Image" }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">No Img</div>
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === prod._id ? (
                    <input
                      type="text"
                      value={editingProduct.title}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, title: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                    />
                  ) : (
                    prod.title
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === prod._id ? (
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                    />
                  ) : (
                    prod.price + " جنيه"
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === prod._id ? (
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full"
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    prod.category
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === prod._id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
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
                      </div>

                      {/* Edit Images Section */}
                      <div className="mt-2">
                        <label className="text-xs font-semibold block mb-1">إضافة صور جديدة:</label>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleImageChange(e, true)}
                          className="text-xs w-full"
                        />
                        {editingImagesPreview.length > 0 && (
                          <div className="flex gap-1 mt-1 overflow-x-auto">
                            {editingImagesPreview.map((src, idx) => (
                              <img key={idx} src={src} alt={`New product image ${idx + 1}`} className="w-8 h-8 object-cover rounded border" />
                            ))}
                          </div>
                        )}
                        {editingProduct.images?.length > 0 && (
                          <div className="mt-2">
                            <label className="text-xs font-semibold block mb-1">الصور الحالية:</label>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {editingProduct.images.map((image, index) => (
                                <div key={`${image}-${index}`} className="flex flex-col items-center gap-1 shrink-0">
                                  <img
                                    src={getImageUrl(image, 96)}
                                    alt={`${editingProduct.title} ${index + 1}`}
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                  <label className="text-[10px] text-emerald-700 cursor-pointer">
                                    {replacementImageIndex === index ? "جاهز للاستبدال" : "استبدال"}
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp"
                                      className="hidden"
                                      onChange={(event) => handleReplacementImageChange(event, index)}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(prod._id, index)}
                                    className="text-red-600 text-[10px]"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition flex items-center gap-1 text-sm"
                      >
                        <Edit size={14} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  لا توجد منتجات حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
