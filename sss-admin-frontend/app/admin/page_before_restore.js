"use client";

import { useState } from "react";
import AdminShell from "../../components/layout/AdminShell";
import Students from "./components/students/Students";
import Teachers from "./components/teachers/Teachers";
import Others from "./components/others/Others";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [language, setLanguage] = useState("English");

  return (
    <AdminShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      language={language}
      onLanguageChange={setLanguage}
    >
      {activeTab === "students" && (
        <Students language={language} />
      )}

      {activeTab === "teachers" && (
        <Teachers language={language} />
      )}

      {activeTab === "others" && (
        <Others language={language} />
      )}
    </AdminShell>
  );
}
