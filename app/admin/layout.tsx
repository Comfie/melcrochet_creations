import type { Metadata, Viewport } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { absolute: "MelCrochet Studio" },
  robots: { index: false, follow: false },
  // "Add to Home Screen" opens the admin as its own app (no browser bars).
  manifest: "/admin.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MelCrochet Studio",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "#151515",
  // Lets the tab bar and sheets pad themselves around the iPhone home
  // indicator and notch via env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
