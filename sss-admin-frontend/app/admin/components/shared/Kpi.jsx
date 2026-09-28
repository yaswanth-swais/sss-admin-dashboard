"use client";

import React from "react";
function Kpi({ title, value, icon: Icon, type, selected }) {
  const styles = {
    total: {
      card: "from-[#103c62] to-[#17244a] border-cyan-400/30",
      icon: "bg-cyan-400/15 text-cyan-300",
      value: "text-cyan-100",
    },
    active: {
      card: "from-[#0d4935] to-[#172d38] border-emerald-400/30",
      icon: "bg-emerald-400/15 text-emerald-300",
      value: "text-emerald-100",
    },
    inactive: {
      card: "from-[#5a3013] to-[#292036] border-orange-400/30",
      icon: "bg-orange-400/15 text-orange-300",
      value: "text-orange-100",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 shadow-xl transition ${
        style.card
      } ${
        selected
          ? "ring-1 ring-white/25"
          : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-black ${style.value}`}
          >
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${style.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}


export default Kpi;
