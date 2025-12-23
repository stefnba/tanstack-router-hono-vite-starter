import { FileWithPath } from 'react-dropzone';

export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    cropShape: 'rect' | 'round' = 'rect'
): Promise<FileWithPath> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // 1. Draw the Round Mask (if applicable)
    if (cropShape === 'round') {
        ctx.beginPath();
        ctx.arc(pixelCrop.width / 2, pixelCrop.height / 2, pixelCrop.width / 2, 0, 2 * Math.PI);
        ctx.clip(); // Everything drawn after this will be clipped to the circle
    }

    // 2. Draw the Image
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // 3. Output as FileWithPath
    return new Promise((resolve, reject) => {
        // Round images MUST be PNG to support transparency
        const type = cropShape === 'round' ? 'image/png' : 'image/jpeg';
        const ext = cropShape === 'round' ? 'png' : 'jpg';

        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            const file = new File([blob], `cropped.${ext}`, { type });
            const fileWithPath = Object.assign(file, { path: `cropped.${ext}` });
            resolve(fileWithPath);
        }, type);
    });
}
