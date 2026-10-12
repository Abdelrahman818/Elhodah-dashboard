import { UserProvider } from "@/context/UserContext";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata = {
  title: "Elhoda Admin",
  description: "Elhoda administration dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
