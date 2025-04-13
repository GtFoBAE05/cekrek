"use client"

import {redirect} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import Button from "@/components/Button";

const colorData: string[] = [
    "White",
    "Black",
    "Coral",
    "Gray",
    "Blue",
    "Yellow",
    "Purple",
    "Maroon",
]

export default function Page() {
    const [storedPhotos, setStoredPhotos] = useState<string | null>(null)
    useEffect(() => {
        const photoSessionStorage = sessionStorage.getItem("photos");
        if (!photoSessionStorage) {
            redirect("/")
        }
        setStoredPhotos(photoSessionStorage)
    }, [])

    const [photoStripColor, setPhotoStripColor] = useState(colorData[0])
    const handlePhotoStripColorChange = (value: string) => {
        setPhotoStripColor(value);
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const photos: string[] = storedPhotos ? JSON.parse(storedPhotos) : [];
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const images = photos.map((src) => {
            const img = new Image();
            img.src = src;
            return img;
        });

        const imageWidth = 220;
        const imageHeight = 140;
        const imageGap = 12;
        const xPadding = 24;
        const yPadding = 8;
        const textHeight = 16;
        const totalHeight = (imageHeight * images.length) + (imageGap * images.length) + yPadding + textHeight;

        Promise.all(
            images.map(
                (img) =>
                    new Promise<void>((resolve) => {
                        img.onload = () => resolve();
                    })
            )
        ).then(() => {
            canvas.width = imageWidth + xPadding;
            canvas.height = totalHeight;

            context.fillStyle = photoStripColor;
            context.fillRect(0, 0, canvas.width, canvas.height);

            const offsetX = (canvas.width - imageWidth) / 2;
            const offsetY = yPadding;

            images.forEach((img, index) => {
                const yPosition = offsetY + (index * (imageHeight + imageGap));
                context.drawImage(img, offsetX, yPosition, imageWidth, imageHeight);
            });

            const dateTime = new Date();
            const formattedDate = dateTime.toLocaleString("en-US", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })

            context.fillStyle = "black";
            context.font = "12px Arial";
            context.textAlign = "center";

            context.fillText(
                formattedDate,
                canvas.width / 2,
                totalHeight - yPadding
            );
        });
    }, [photoStripColor, storedPhotos]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'photo-strip.png';
        link.click();
    }

    return (
        <div className={"w-full h-dvh"}>
            <main className={"flex flex-col gap-4 items-center justify-center w-full h-dvh overflow-y-scroll"}>
                <h1 className={"text-2xl font-bold"}>Photo Preview</h1>

                <div className={"grid grid-cols-2 gap-8"}>
                    <div>
                        <canvas
                            ref={canvasRef}
                            className={"rounded-sm shadow-2xl"}
                        >
                        </canvas>
                    </div>

                    <div className={"flex flex-col gap-4"}>
                        <h2 className={"text-xl"}>Customize your photo</h2>
                        <div className={"grid grid-cols-2 gap-2"}>
                            {
                                colorData.map(value => (
                                    <Button
                                        key={value}
                                        onClick={() => handlePhotoStripColorChange(value)}
                                        variant={photoStripColor == value ? "primary" : "outline"}
                                    >
                                        {value}
                                    </Button>
                                ))
                            }
                        </div>

                        <Button
                            variant={"primary"}
                            className={"mt-8"}
                            onClick={handleDownload}
                        >
                            Download Photo
                        </Button>

                    </div>
                </div>
            </main>
        </div>
    )
}