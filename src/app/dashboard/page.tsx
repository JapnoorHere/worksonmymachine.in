import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "You are user #10,000,000. So is everyone.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
