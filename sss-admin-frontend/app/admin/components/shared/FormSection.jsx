"use client";

import React from "react";
function FormSection({ title, children }) {
  return (
    <section>
      <div className="mb-2.5">
        <h4 className="text-sm font-bold">{title}</h4>
      </div>

      {children}
    </section>
  );
}


export default FormSection;
