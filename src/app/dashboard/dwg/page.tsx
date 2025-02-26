"use client";

import { useState } from "react";

const page = () => {
    const [width, setWidth] = useState(10);
    const [height, setHeight] = useState(10);
    const [depth, setDepth] = useState(10);
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        setDownloadUrl("");

        const response = await fetch("/api/generate-dwg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ width, height, depth }),
        });

        const data = await response.json();
        setLoading(false);
        if (data.file) {
            setDownloadUrl(data.file);
        }
    };

    return (
        <div className="p-5">
            <h2 className="text-lg font-bold mb-4">Enter Building Dimensions</h2>
            <div className="space-y-3">
                <div>
                    <label className="block">Width (m)</label>
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>
                <div>
                    <label className="block">Height (m)</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>
                <div>
                    <label className="block">Depth (m)</label>
                    <input
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Generate DWG"}
                </button>

                {downloadUrl && (
                    <div className="mt-4">
                        <a href={downloadUrl} download className="text-blue-600 underline">
                            Download DWG File
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
export default page