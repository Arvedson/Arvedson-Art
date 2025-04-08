"use client"
import { useState } from "react";

export default function ImageUploader({ onUpload }: { onUpload: (file: File, palette: string[]) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [palette, setPalette] = useState<string[]>(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000"]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (file) {
            onUpload(file, palette);
        }
    };

    return (
        <div className="p-4">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div className="flex space-x-2 mt-2">
                {palette.map((color, index) => (
                    <input key={index} type="color" value={color} onChange={(e) => {
                        const newPalette = [...palette];
                        newPalette[index] = e.target.value;
                        setPalette(newPalette);
                    }} />
                ))}
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 mt-4" onClick={handleUpload}>
                Procesar Imagen
            </button>
        </div>
    );
}
