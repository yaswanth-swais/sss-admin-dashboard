"use client";

import { useState } from "react";
import AdminShell from "../../components/layout/AdminShell";
import Students from "./components/students/Students";
import Teachers from "./components/teachers/Teachers";
import Others from "./components/others/Others";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <AdminShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "students" && <Students />}
      {activeTab === "teachers" && <Teachers />}
      {activeTab === "others" && <Others />}
    </AdminShell>
  );
}