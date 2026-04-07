"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Place } from "@/src/types/place";

type AddPlaceFormProps = {
  onCreated: (place: Place | null) => void;
};

export default function AddPlaceForm({ onCreated }: AddPlaceFormProps) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    description: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const [tags, setTags] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    const fetchMeta = async () => {
      const res = await fetch("/api/meta");
      const data = await res.json();

      setTags(data.tags);
      setFacilities(data.facilities);
    };

    fetchMeta();
  }, []);

  const handleClose = () => {
    toast("確定不新增嗎？", {
      icon: "🤔",
    });
  
    onCreated?.(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isNaN(Number(form.lat)) || isNaN(Number(form.lng))) {
      toast.error("請輸入正確的經緯度！");
      return;
    }

    try {
      const res = await fetch("/api/places", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          lat: Number(form.lat),
          lng: Number(form.lng),
          tags: selectedTags,
          facilities: selectedFacilities,
        }),
      });

      if (!res.ok) throw new Error("fail");

      const data = await res.json();

      onCreated(data);
      toast.success("新增成功 🎉");

      setForm({
        name: "",
        address: "",
        lat: "",
        lng: "",
        description: "",
      });
      setSelectedTags([]);
      setSelectedFacilities([]);
    } catch (err) {
      console.error(err);
      toast.error("暫時無法新增");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">

    {/* ❌ 右上角關閉
    <button
      type="button"
      onClick={handleClose}
      className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
    >
      ✕
    </button> */}

    <h2 className="text-lg font-semibold text-gray-800">新增地點</h2>

    {/* 名稱 */}
    <div>
      <label className="text-sm text-gray-600">
        名稱 <span className="text-gray-400">*</span>
      </label>
      <input
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#b06000]"
      />
    </div>

    {/* 地址 */}
    <div>
      <label className="text-sm text-gray-600">
        地址 <span className="text-gray-400">*</span>
      </label>
      <input
        required
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#b06000]"
      />
    </div>

    {/* 緯度 */}
    <div>
      <label className="text-sm text-gray-600">
        緯度 <span className="text-gray-400">*</span>
      </label>
      <input
        type="number"
        step="any"
        required
        value={form.lat}
        onChange={(e) => setForm({ ...form, lat: e.target.value })}
        className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#b06000]"
      />
    </div>

    {/* 經度 */}
    <div>
      <label className="text-sm text-gray-600">
        經度 <span className="text-gray-400">*</span>
      </label>
      <input
        type="number"
        step="any"
        required
        value={form.lng}
        onChange={(e) => setForm({ ...form, lng: e.target.value })}
        className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#b06000]"
      />
    </div>

    {/* 描述 */}
    <div>
      <label className="text-sm text-gray-600">描述</label>
      <textarea
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#b06000]"
      />
    </div>

    {/* Tags */}
    <div>
      <p className="text-sm text-gray-600 mb-2">分類</p>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag.id);

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                setSelectedTags((prev) =>
                  active
                    ? prev.filter((id) => id !== tag.id)
                    : [...prev, tag.id]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm border transition
                ${
                  active
                    ? "bg-[#b06000] text-white border-[#b06000]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-[#fff4e5]"
                }`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>

    {/* Facilities */}
    <div>
      <p className="text-sm text-gray-600 mb-2">設施</p>
      <div className="flex gap-2 flex-wrap">
        {facilities.map((f) => {
          const active = selectedFacilities.includes(f.id);

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelectedFacilities((prev) =>
                  active
                    ? prev.filter((id) => id !== f.id)
                    : [...prev, f.id]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm border transition
                ${
                  active
                    ? "bg-[#b06000] text-white border-[#b06000]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-[#fff4e5]"
                }`}
            >
              {f.name}
            </button>
          );
        })}
      </div>
    </div>

    {/* 按鈕 */}
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 rounded-xl border border-gray-300"
      >
        取消
      </button>

      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-[#b06000] text-white
                  hover:opacity-90 transition"
      >
        新增
      </button>
    </div>
    </form>
  );
}
