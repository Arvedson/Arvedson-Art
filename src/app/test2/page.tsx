"use client"
import { useState } from "react";
import ImageUploader from "./../components/ImageUploader";

export default function Test2() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleUpload = async (file: File, palette: string[]) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result?.toString().split(",")[1];

            const response = await fetch("/api/process-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image, palette }),
            });

            if (response.ok) {
                const blob = await response.blob();
                setImageUrl(URL.createObjectURL(blob));
            } else {
                alert("Error procesando la imagen");
            }
        };
    };

    return (
        <div className="flex flex-col items-center p-10">
            <h1 className="text-2xl font-bold">Transforma tu imagen</h1>
            <ImageUploader onUpload={handleUpload} />
            {imageUrl && <img src={imageUrl} alt="Imagen transformada" className="mt-4 border p-2" />}
        </div>
    );
}
