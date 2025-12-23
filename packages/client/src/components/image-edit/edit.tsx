import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import Cropper, { Area } from 'react-easy-crop';

import { getCroppedImg } from '@app/client/lib/crop-image';

export interface ImageCropperRef {
    save: () => Promise<void>;
}

export interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedFile: FileWithPath) => void;
    aspect?: number;
    cropShape?: 'rect' | 'round';
}

export const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
    ({ imageSrc, onCropComplete, aspect = 1, cropShape = 'rect' }, ref) => {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [zoom, setZoom] = useState(1);
        const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

        const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        }, []);

        const handleSave = async () => {
            if (!imageSrc || !croppedAreaPixels) return;

            try {
                const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, cropShape);
                onCropComplete(croppedFile);
            } catch (e) {
                console.error(e);
            }
        };

        useImperativeHandle(ref, () => ({
            save: handleSave,
        }));

        return (
            <div className="flex flex-col h-full w-full">
                {/* Cropper Container */}
                <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape={cropShape}
                        showGrid={cropShape === 'rect'}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* Controls */}
                <div className="pt-4 flex items-center gap-4 max-w-sm">
                    <span className="text-sm font-medium w-12">Zoom</span>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                </div>
            </div>
        );
    }
);
