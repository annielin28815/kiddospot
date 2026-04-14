"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Place } from "@/src/types/place";

type AddPlaceFormProps = {
  onCreated: (place: Place) => void;
  onCancel: () => void;
};

const LocationPickerMap = dynamic(
  () => import("@/src/components/LocationPickerMap"),
  { ssr: false }
);

export default function AddPlaceForm({ 
  onCreated, 
  onCancel 
}: AddPlaceFormProps) {
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
  const latValue = form.lat !== "" && !Number.isNaN(Number(form.lat)) ? Number(form.lat) : null;
  const lngValue = form.lng !== "" && !Number.isNaN(Number(form.lng)) ? Number(form.lng) : null;

  function handlePickLocation(coords: { lat: number; lng: number }) {
    setForm((prev) => ({
      ...prev,
      lat: coords.lat.toFixed(6),
      lng: coords.lng.toFixed(6),
    }));
  }

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
    // toast("確定不新增嗎？", {
    //   icon: "🤔",
    // });
  
    onCancel();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <label className="mb-2 block text-sm font-semibold text-brand-ink dark:text-white">
          名稱 <span className="text-brand-softInk">*</span>
        </label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-2xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-peach dark:bg-[#2A2421]"
        />
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-brand-ink dark:text-white">
          地址 <span className="text-brand-softInk">*</span>
        </label>
        <input
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded-2xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-peach dark:bg-[#2A2421]"
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-brand-ink dark:text-white">
              地圖選點
            </h3>
            <p className="mt-1 text-xs text-brand-softInk dark:text-white/70">
              可以直接點一下地圖，自動帶入經緯度
            </p>
          </div>
        </div>

        <LocationPickerMap
          lat={latValue}
          lng={lngValue}
          onPick={handlePickLocation}
        />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-ink dark:text-white">
            緯度 *
          </label>
          <input
            type="number"
            step="any"
            required
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            className="w-full rounded-2xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-peach dark:bg-[#2A2421]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-ink dark:text-white">
            經度 *
          </label>
          <input
            type="number"
            step="any"
            required
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            className="w-full rounded-2xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-peach dark:bg-[#2A2421]"
          />
        </div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-brand-ink dark:text-white">
          描述
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full rounded-2xl border border-brand-line bg-brand-cream px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-peach dark:bg-[#2A2421]"
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-brand-ink dark:text-white">
          分類
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const selected = selectedTags.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTags((prev) =>
                    selected
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id]
                  )
                }
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  selected
                    ? "border-brand-peach bg-brand-peach/15"
                    : "border-brand-line bg-white hover:bg-brand-cream",
                ].join(" ")}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-brand-ink dark:text-white">
          設施
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {facilities.map((f) => {
            const selected = selectedFacilities.includes(f.id);

            return (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setSelectedFacilities((prev) =>
                    selected
                      ? prev.filter((id) => id !== f.id)
                      : [...prev, f.id]
                  )
                }
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  selected
                    ? "border-brand-mint bg-brand-mint/15"
                    : "border-brand-line bg-white hover:bg-brand-cream",
                ].join(" ")}
              >
                {f.name}
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t border-brand-line pt-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-brand-line bg-white text-sm font-semibold text-brand-softInk hover:bg-brand-sand"
          >
            取消
          </button>

          <button
            type="submit"
            className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-brand-peach text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            新增地點
          </button>
        </div>
      </div>
    </form>
  );
}
