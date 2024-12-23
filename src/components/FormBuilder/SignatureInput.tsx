"use client";
import React, { useRef } from "react";
import SignaturePad from "react-signature-canvas";

const SignatureInput = ({ label }) => {
  const sigPad = useRef();

  const clearSignature = () => {
    sigPad.current.clear();
  };

  return (
    <div className="border p-4 rounded-md">
      <label className="block mb-2 font-bold">{label || "Signature"}</label>
      <SignaturePad ref={sigPad} canvasProps={{ className: "border w-full h-32" }} />
      <button
        type="button"
        onClick={clearSignature}
        className="mt-2 px-4 py-1 bg-red-500 text-white rounded"
      >
        Clear Signature
      </button>
    </div>
  );
};

export default SignatureInput;
