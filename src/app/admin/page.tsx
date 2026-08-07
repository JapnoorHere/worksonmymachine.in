import type { Metadata } from "next";
import { AdminQueue } from "@/components/admin/AdminQueue";

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminQueue />;
}
