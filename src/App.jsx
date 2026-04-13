import React, { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { toPng, toJpeg } from "html-to-image";
import { Download, Settings, Link as LinkIcon, Palette, Maximize, RefreshCw, Check, Type, Layout, FileText, History, Trash2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
    const [qrType, setQrType] = useState("url");
    const [url, setUrl] = useState("https://google.com");
    const [text, setText] = useState("");

    const [size, setSize] = useState(204);
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [logo, setLogo] = useState(null);
    const [logoSize, setLogoSize] = useState(40);
    const [level, setLevel] = useState("H");

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem("qr_history");
        return saved ? JSON.parse(saved) : [];
    });

    const qrRef = useRef(null);
    const fileInputRef = useRef(null);

    const getQRValue = () => {
        switch (qrType) {
            case "url":
                return url || " ";
            case "text":
                return text || " ";
            default:
                return " ";
        }
    };

    const addToHistory = () => {
        const value = getQRValue();
        if (!value.trim()) return;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: qrType,
            value: value,
            timestamp: Date.now(),
        };

        const newHistory = [newItem, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("qr_history", JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("qr_history");
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadImage = async (format) => {
        if (!qrRef.current) return;

        try {
            if (format === "svg") {
                const svgElement = qrRef.current.querySelector("svg");
                if (svgElement) {
                    const svgData = new XMLSerializer().serializeToString(svgElement);
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    const downloadLink = document.createElement("a");
                    downloadLink.href = svgUrl;
                    downloadLink.download = `qrcode-${Date.now()}.svg`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            } else {
                const dataUrl = format === "png" ? await toPng(qrRef.current, { quality: 1.0, backgroundColor: bgColor }) : await toJpeg(qrRef.current, { quality: 1.0, backgroundColor: bgColor });

                const link = document.createElement("a");
                link.download = `qrcode-${Date.now()}.${format}`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const presetColors = ["#000000", "#03C75A", "#FF4B4B", "#FF8A00", "#FFD600", "#00B8FF", "#2D5BFF", "#7C3AED"];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">QR Maker</h1>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-8 space-y-6">
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                                    <h2 className="text-lg font-semibold">Select Content Type</h2>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {["url", "text"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setQrType(type)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                                qrType === type ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        >
                                            {type === "url" && <LinkIcon className="w-4 h-4" />}
                                            {type === "text" && <FileText className="w-4 h-4" />}
                                            <span className="capitalize">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {qrType === "url" && (
                                    <div className="relative">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Website URL</label>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
                                        />
                                    </div>
                                )}

                                {qrType === "text" && (
                                    <div className="relative">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Plain Text</label>
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Enter your text here..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 resize-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Step 2: Customization */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">2</div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-400" />
                                    Customize QR Code
                                </h2>
                            </div>

                            <div className="space-y-8">
                                {/* Logo Section */}
                                <div>
                                    <label className="text-sm font-medium text-slate-500 mb-4 block flex items-center gap-2">
                                        <Layout className="w-4 h-4" />
                                        Center Logo (Optional)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium text-slate-600 flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4 rotate-180" />
                                            {logo ? "Change Logo" : "Upload Logo"}
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        {logo && (
                                            <button onClick={() => setLogo(null)} className="text-xs text-red-500 font-bold hover:underline">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Color Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 mb-4 block flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Foreground Color
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {presetColors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setFgColor(color)}
                                                    className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                                                        fgColor === color ? "border-slate-800 scale-110 shadow-md" : "border-transparent"
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {fgColor === color && <Check className={`w-5 h-5 ${color === "#ffffff" ? "text-slate-800" : "text-white"}`} />}
                                                </button>
                                            ))}
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    value={fgColor}
                                                    onChange={(e) => setFgColor(e.target.value)}
                                                    className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                                                />
                                                <div
                                                    className="w-10 h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white group-hover:border-slate-300 transition-all"
                                                    style={{ background: `conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 mb-4 block flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-slate-300" />
                                            Background Color
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {["#ffffff", "#F8FAFC", "#F1F5F9", "#E2E8F0"].map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setBgColor(color)}
                                                    className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                                                        bgColor === color ? "border-slate-800 scale-110 shadow-md" : "border-slate-200"
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {bgColor === color && <Check className="w-5 h-5 text-slate-800" />}
                                                </button>
                                            ))}
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    value={bgColor}
                                                    onChange={(e) => setBgColor(e.target.value)}
                                                    className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
                                                />
                                                <div
                                                    className="w-10 h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white group-hover:border-slate-300 transition-all"
                                                    style={{ background: `conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Size & Advanced */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 mb-4 block flex items-center gap-2">
                                            <Maximize className="w-4 h-4" />
                                            Size (px)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input type="range" min="128" max="1024" step="8" value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1 accent-blue-600" />
                                            <span className="text-sm font-mono font-bold bg-slate-100 px-3 py-1 rounded-md text-slate-700 min-w-[60px] text-center">{size}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 mb-4 block flex items-center gap-2">
                                            <Type className="w-4 h-4" />
                                            Error Correction
                                        </label>
                                        <div className="flex gap-2">
                                            {["L", "M", "Q", "H"].map((l) => (
                                                <button
                                                    key={l}
                                                    onClick={() => setLevel(l)}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                                                        level === l ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                                    }`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column: Preview & Download */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                                <h2 className="text-lg font-semibold">Preview</h2>
                            </div>

                            <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-8 mb-8 border border-slate-100 overflow-hidden">
                                <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-lg" style={{ backgroundColor: bgColor }}>
                                    <QRCodeSVG
                                        value={getQRValue()}
                                        size={204}
                                        fgColor={fgColor}
                                        bgColor={bgColor}
                                        level={level}
                                        includeMargin={false}
                                        className="w-full h-full"
                                        imageSettings={
                                            logo
                                                ? {
                                                      src: logo,
                                                      height: (logoSize / size) * 204,
                                                      width: (logoSize / size) * 204,
                                                      excavate: true,
                                                  }
                                                : undefined
                                        }
                                    />
                                    {/* Hidden Canvas for export */}
                                    <div className="hidden">
                                        <QRCodeCanvas
                                            value={getQRValue()}
                                            size={size}
                                            fgColor={fgColor}
                                            bgColor={bgColor}
                                            level={level}
                                            includeMargin={true}
                                            imageSettings={
                                                logo
                                                    ? {
                                                          src: logo,
                                                          height: logoSize,
                                                          width: logoSize,
                                                          excavate: true,
                                                      }
                                                    : undefined
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        addToHistory();
                                        downloadImage("png");
                                    }}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PNG
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            addToHistory();
                                            downloadImage("jpg");
                                        }}
                                        className="py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        JPG
                                    </button>
                                    <button
                                        onClick={() => {
                                            addToHistory();
                                            downloadImage("svg");
                                        }}
                                        className="py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        SVG
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* History Section */}
                        <AnimatePresence>
                            {history.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <History className="w-5 h-5 text-slate-400" />
                                            Recent History
                                        </h2>
                                        <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {history.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                                                        {item.type === "url" && <LinkIcon className="w-4 h-4 text-blue-500" />}
                                                        {item.type === "text" && <FileText className="w-4 h-4 text-emerald-500" />}
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{item.value}</p>
                                                        <p className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            if (item.type === "url") setUrl(item.value);
                                                            if (item.type === "text") setText(item.value);
                                                            setQrType(item.type);
                                                        }}
                                                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 py-12 border-t border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm">Professional QR Code Generator Tool. No login required.</p>
                </div>
            </footer>
        </div>
    );
}
