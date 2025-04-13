export default async function applyFilterToBase64(base64: string, filter: string): Promise<string> {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    const img = new Image();
    img.src = base64;

    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
    });

    canvas.width = img.width;
    canvas.height = img.height;

    context.filter = filter;
    context.drawImage(img, 0, 0);

    return canvas.toDataURL("image/jpeg");
}
