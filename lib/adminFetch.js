import { BASE_API_URL } from "@/config";
import { getFirebaseAuth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

export async function adminFetch(url, options = {}) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Admin authentication is required");

  const requestUrl = new URL(url, BASE_API_URL);
  const apiOrigin = new URL(BASE_API_URL).origin;
  if (requestUrl.origin !== apiOrigin) {
    throw new Error("Admin requests must target the configured API origin");
  }

  const headers = new Headers(options.headers || {});
  const getToken = async (forceRefresh = false) => {
    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      await signOut(auth);
      throw new Error("Unable to obtain valid admin authentication. Please sign in again.", {
        cause: error,
      });
    }
  };
  const send = async (forceRefresh = false) => {
    const token = await getToken(forceRefresh);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(requestUrl, { ...options, headers });
  };

  const response = await send();
  if (response.status !== 401) return response;

  const refreshedResponse = await send(true);
  if (refreshedResponse.status === 401) {
    await signOut(auth);
    throw new Error("Your admin session is no longer valid. Please sign in again.");
  }

  return refreshedResponse;
}
