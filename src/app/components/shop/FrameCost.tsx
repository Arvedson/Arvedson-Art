"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface Frame {
  id: number;
  width: number;
  height: number;
  price: number;
}

interface FormState {
  width: string;
  height: string;
  price: string;
}

export default function FrameCost() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [form, setForm] = useState<FormState>({ width: "", height: "", price: "" });
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    try {
      const res = await fetch("/api/framecost");
      const data: Frame[] = await res.json();
      setFrames(data);
    } catch (error) {
      console.error("Error fetching frames:", error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const url = editing !== null ? `/api/framecost/${editing}` : "/api/framecost";
      const method = editing !== null ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          width: Number(form.width),
          height: Number(form.height),
          price: Number(form.price)
        }),
      });

      if (res.ok) {
        fetchFrames();
        setForm({ width: "", height: "", price: "" });
        setEditing(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (frame: Frame) => {
    setEditing(frame.id);
    setForm({
      width: frame.width.toString(),
      height: frame.height.toString(),
      price: frame.price.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/framecost/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFrames();
      }
    } catch (error) {
      console.error("Error deleting frame:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Administrar Precios de Cuadros</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <input
          type="number"
          name="width"
          placeholder="Ancho (cm)"
          value={form.width}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="height"
          placeholder="Alto (cm)"
          value={form.height}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Precio (MXN)"
          value={form.price}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          {editing ? "Actualizar" : "Crear"}
        </button>
      </form>

      <div className="space-y-2">
        {frames.length > 0 ? (
          frames.map((frame) => (
            <div
              key={frame.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <span>
                {frame.width} x {frame.height} - ${frame.price}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(frame)}
                  className="bg-green-500 text-white py-1 px-2 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(frame.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron precios.</p>
        )}
      </div>
    </div>
  );
}