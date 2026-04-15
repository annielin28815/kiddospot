"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Place } from "@/src/types/place";
import { ui } from "@/src/lib/ui";

type AddPlaceFormProps = {
  onCreated: (place: Place) => void;
  onCancel: () => void;
};

type MetaOption = {
  id: string;
  name: string;
};

const LocationPickerMap = dynamic(
  () => import("@/src/components/LocationPickerMap"),
  { ssr: false }
);

const selectablePillBase =
  "rounded-full border px-4 py-2 text-sm font-medium transition";

const selectablePillNeutral =
  "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-page)] dark:bg-white/10 dark:text-[var(--color-text-secondary)] dark:hover:bg-white/15";

const selectablePillPeachActive =
  "border-[#F4A261] bg-[#F4A261]/15 text-[#8A4B00] dark:border-[#F4A261]/50 dark:bg-[#F4A261]/16 dark:text-[#F4A261]";

const selectablePillMintActive =
  "border-[#8CBF9F] bg-[#8CBF9F]/15 text-[#456A54] dark:border-[#8CBF9F]/50 dark:bg-[#8CBF9F]/16 dark:text-[#8CBF9F]";

export default function AddPlaceForm({
  onCreated,
  onCancel,
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

  const [tags, setTags] = useState<MetaOption[]>([]);
  const [facilities, setFacilities] = useState<MetaOption[]>([]);

  const latValue =
    form.lat !== "" && !Number.isNaN(Number(form.lat)) ? Number(form.lat) : null;
  const lngValue =
    form.lng !== "" && !Number.isNaN(Number(form.lng)) ? Number(form.lng) : null;

  function handlePickLocation(coords: { lat: number; lng: number }) {
    setForm((prev) => ({
      ...prev,
      lat: coords.lat.toFixed(6),
      lng: coords.lng.toFixed(6),
    }));
  }

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch("/api/meta");
        if (!res.ok) throw new Error("Failed to fetch meta");

        const data = await res.json();
        setTags(data.tags ?? []);
        setFacilities(data.facilities ?? []);
      } catch (error) {
        console.error(error);
        toast.error("暫時無法載入分類資料");
      }
    };

    fetchMeta();
  }, []);

  const handleClose = () => {
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Number.isNaN(Number(form.lat)) || Number.isNaN(Number(form.lng))) {
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
      <section className={ui.section}>
        <label className={ui.fieldLabel}>
          名稱 <span className={ui.muted}>*</span>
        </label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={ui.inputBase}
          placeholder="例如：親子友善咖啡廳"
        />
      </section>

      <section className={ui.section}>
        <label className={ui.fieldLabel}>
          地址 <span className={ui.muted}>*</span>
        </label>
        <input
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className={ui.inputBase}
          placeholder="請輸入完整地址"
        />
      </section>

      <section className={ui.section}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={ui.sectionTitle}>地圖選點</h3>
            <p className={ui.fieldHint}>可以直接點一下地圖，自動帶入經緯度</p>
          </div>
        </div>

        <div className={`${ui.modalPanel} overflow-hidden p-2`}>
          <LocationPickerMap
            lat={latValue}
            lng={lngValue}
            onPick={handlePickLocation}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className={ui.section}>
          <label className={ui.fieldLabel}>緯度 *</label>
          <input
            type="number"
            step="any"
            required
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            className={ui.inputBase}
            placeholder="例如：25.033964"
          />
        </div>

        <div className={ui.section}>
          <label className={ui.fieldLabel}>經度 *</label>
          <input
            type="number"
            step="any"
            required
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            className={ui.inputBase}
            placeholder="例如：121.564468"
          />
        </div>
      </section>

      <section className={ui.section}>
        <label className={ui.fieldLabel}>描述</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className={ui.textarea}
          rows={4}
          placeholder="補充地點特色、適合年齡、注意事項..."
        />
      </section>

      <section className={ui.section}>
        <h3 className={ui.sectionTitle}>分類</h3>

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
                  selectablePillBase,
                  selected
                    ? selectablePillPeachActive
                    : selectablePillNeutral,
                ].join(" ")}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className={ui.section}>
        <h3 className={ui.sectionTitle}>設施</h3>

        <div className="flex flex-wrap gap-2.5">
          {facilities.map((facility) => {
            const selected = selectedFacilities.includes(facility.id);

            return (
              <button
                key={facility.id}
                type="button"
                onClick={() =>
                  setSelectedFacilities((prev) =>
                    selected
                      ? prev.filter((id) => id !== facility.id)
                      : [...prev, facility.id]
                  )
                }
                className={[
                  selectablePillBase,
                  selected
                    ? selectablePillMintActive
                    : selectablePillNeutral,
                ].join(" ")}
              >
                {facility.name}
              </button>
            );
          })}
        </div>
      </section>

      <div className={`${ui.divider} pt-4`}>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className={`${ui.buttonBase} ${ui.buttonMd} ${ui.buttonSecondary} flex-1`}
          >
            取消
          </button>

          <button
            type="submit"
            className={`${ui.buttonBase} ${ui.buttonMd} ${ui.buttonPrimary} flex-[1.4]`}
          >
            新增地點
          </button>
        </div>
      </div>
    </form>
  );
}