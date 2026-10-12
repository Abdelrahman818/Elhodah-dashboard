import { BASE_API_URL } from "@/config";

export function getImageUrl(image, width = 600) {
  if (!image) return "";

  const source = /^https?:\/\//i.test(image) || image.startsWith("blob:")
    ? image
    : `${BASE_API_URL.replace(/\/+$/, "")}/${image.replace(/^\/+/, "")}`;

  if (!source.includes("res.cloudinary.com/") || !source.includes("/image/upload/")) {
    return source;
  }

  const transformation = `f_auto,q_auto,c_limit,w_${Math.max(1, Math.round(width))}`;
  return source.replace("/image/upload/", `/image/upload/${transformation}/`);
}
