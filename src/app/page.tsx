"use client"

import Image, {StaticImageData} from "next/image";
import FourPoseImage from "../../public/four-pose.png";
import {useCallback, useRef, useState} from "react";
import Webcam from "react-webcam";
import Button from "@/components/Button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import applyFilterToBase64 from "@/utils/ImageUtil";
import Link from "next/link";

interface PhotoLayout {
    name: string
    image: StaticImageData
    totalPhoto: number
}

const photoLayouts: PhotoLayout[] = [
    {
        name: "4 Pose",
        image: FourPoseImage,
        totalPhoto: 4
    },
    {
        name: "3 Pose",
        image: FourPoseImage,
        totalPhoto: 3
    },
    {
        name: "2 Pose",
        image: FourPoseImage,
        totalPhoto: 2
    },
]

interface PhotoFilter {
    name: string
    filter: string
}

const photoFilters: PhotoFilter[] = [
    {
        name: "Normal",
        filter: "",
    },
    {
        name: "B&W",
        filter: "grayscale(100%)",
    },
    {
        name: "Vintage",
        filter: "sepia(50%) contrast(90%) brightness(90%)",
    },
    {
        name: "Blur",
        filter: "blur(4px)",
    },
    {
        name: "Polaroid",
        filter: "contrast(120%) saturate(150%)",
    },
    {
        name: "Warm",
        filter: "sepia(20%) contrast(100%) saturate(150%)",
    }
]

export default function Page() {
    const [selectedLayout, setSelectedLayout] = useState<PhotoLayout>(photoLayouts[2]);
    const handleLayoutChange = (value: string) => {
        const photoLayoutResult: PhotoLayout = photoLayouts.find(photoLayouts => photoLayouts.name === value) || photoLayouts[0];
        setSelectedLayout(photoLayoutResult)
    }

    const [selectedFilter, setSelectedFilter] = useState(photoFilters[0])
    const handleFilterChange = (index: number) => {
        setSelectedFilter(photoFilters[index])
    }

    const [selectedDelay, setSelectedDelay] = useState<string>("3")
    const handleDelayChange = (value: string) => {
        setSelectedDelay(value)
        setCountdown(parseInt(value))
    }

    const [isCapturing, setIsCapturing] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const [savedPhoto, setSavedPhoto] = useState<string[]>([])

    const handleToPreviewPage = () => {
        sessionStorage.setItem("photos", JSON.stringify(savedPhoto));
    }

    const webcamRef = useRef(null);
    const handleCaptureImage = useCallback(() => {
        setIsCapturing(true);

        let countdown = parseInt(selectedDelay);
        setCountdown(countdown);

        const intervalId = setInterval(async () => {
            if (countdown > 0) {
                countdown--;
                setCountdown(countdown);
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const plainImage = webcamRef.current?.getScreenshot();
                if (!plainImage) return;
                const imageSrc = await applyFilterToBase64(plainImage, selectedFilter.filter);

                setSavedPhoto(prevSaved => {
                    const newSavedPhotos = [...prevSaved, imageSrc];

                    if (newSavedPhotos.length === selectedLayout.totalPhoto) {
                        setIsCapturing(false);
                        clearInterval(intervalId);
                    }

                    return newSavedPhotos;
                });

                countdown = parseInt(selectedDelay);
                setCountdown(countdown);
            }
        }, 1000);

        return () => clearInterval(intervalId);

    }, [selectedDelay, selectedLayout, selectedFilter, webcamRef]);

    return (
        <div className={"w-full h-dvh"}>
            <main className={"flex flex-col gap-4 items-center justify-center w-full h-full"}>
                <div className={"grid grid-cols-2 gap-4"}>
                    <Select defaultValue={selectedLayout.name} onValueChange={handleLayoutChange}
                            disabled={savedPhoto.length > 0 || isCapturing}>
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {photoLayouts.map(value => (
                                    <SelectItem key={value.name} value={value.name}>{value.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select defaultValue={selectedDelay} onValueChange={handleDelayChange}
                            disabled={savedPhoto.length > 0 || isCapturing}>
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={"3"}>3s Delay</SelectItem>
                                <SelectItem value={"5"}>5s Delay</SelectItem>
                                <SelectItem value={"10"}>10s Delay</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className={"flex flex-row gap-4 items-center"}>
                    <div className="relative">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={640}
                            height={480}
                            className="rounded-2xl"
                            style={{filter: selectedFilter.filter}}
                        />
                        <h1
                            className={`absolute inset-0 flex items-center justify-center text-6xl font-bold text-white ${!isCapturing ? "hidden" : ""}`}>
                            {countdown}
                        </h1>
                    </div>
                    <div className={"flex flex-col gap-4"}>
                        {savedPhoto.map((value, index) => (
                            <Image
                                key={index}
                                src={decodeURIComponent(value)}
                                alt={value}
                                width={120}
                                height={80}
                                className={"rounded-2xl w-[120px] h-[80px] object-cover"}
                            />
                        ))}
                    </div>
                </div>

                {
                    (savedPhoto.length == selectedLayout.totalPhoto) && !isCapturing ?
                        <Link href={"/preview"}>
                            <Button variant={"primary"} onClick={handleToPreviewPage}>Next</Button>
                        </Link>
                        :
                        <Button variant={"primary"} onClick={handleCaptureImage}
                                disabled={isCapturing || savedPhoto.length != 0}>📷 {isCapturing ? "Say Cekrek..." : "Start Cekrek"}</Button>
                }

                <h2>Choose a filter!</h2>
                <div className={"flex flex-row gap-4 "}>
                    {photoFilters.map((value, index) => (
                        <Button
                            key={index}
                            onClick={() => handleFilterChange(index)}
                            variant={selectedFilter.name == value.name ? "primary" : "outline"}
                            disabled={isCapturing || savedPhoto.length != 0}
                        >
                            {value.name}
                        </Button>
                    ))}
                </div>

            </main>
        </div>
    )
}