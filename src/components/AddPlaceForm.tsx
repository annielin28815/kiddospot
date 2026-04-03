"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddPlaceForm({ onCreated }: any) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    description: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isNaN(Number(form.lat)) || isNaN(Number(form.lng))) {
      alert("請輸入正確的經緯度！");
      return;
    }

    const payload = {
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
    };

    const res = await fetch("/api/places", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    onCreated(data);
    toast.success("新增成功 🎉");
    setForm({ name: "", address: "", lat: "", lng: "", description: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded space-y-2"
    >
      <input
        placeholder="名稱"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
        className="border p-2 w-full"
      />

      <input
        placeholder="地址"
        value={form.address}
        onChange={(e) =>
          setForm({ ...form, address: e.target.value })
        }
        className="border p-2 w-full"
      />

      <input
        placeholder="緯度"
        value={form.lat}
        onChange={(e) =>
          setForm({ ...form, lat: e.target.value })
        }
        className="border p-2 w-full"
      />

      <input
        placeholder="經度"
        value={form.lng}
        onChange={(e) =>
          setForm({ ...form, lng: e.target.value })
        }
        className="border p-2 w-full"
      />

      <textarea
        placeholder="描述"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="border p-2 w-full"
      />

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        新增
      </button>
    </form>
  );
}