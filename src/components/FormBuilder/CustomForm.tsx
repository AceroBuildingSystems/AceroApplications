"use client";

import React from "react";
import { ReactFormGenerator } from "react-form-builder2";
import "react-form-builder2/dist/app.css";

export default function CustomForm({ formData }) {
  return (
    <div>
      <ReactFormGenerator
        data={formData}
        read_only={true}
        hide_actions={true}
      />
    </div>
  );
}
