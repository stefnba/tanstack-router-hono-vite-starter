import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileWithPath } from 'react-dropzone';

import { ImageCropper, ImageCropperRef } from './edit';

export const useImageCropper = ({
    onCropComplete,
    aspect = 1,
    cropShape = 'rect',
}: {
    onCropComplete: (file: FileWithPath) => void;
    aspect?: number;
    cropShape?: 'rect' | 'round';
}) => {
    const ref = useRef<ImageCropperRef>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [croppedFile, setCroppedFile] = useState<FileWithPath | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loadImage = useCallback((file: File) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result as string);
        });
        reader.readAsDataURL(file);
    }, []);

    const handleCropComplete = useCallback(
        (file: FileWithPath) => {
            setCroppedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onCropComplete(file);
        },
        [onCropComplete]
    );

    const save = useCallback(() => {
        ref.current?.save();
    }, []);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const CropperComponent = useMemo(() => {
        return () => (
            <ImageCropper
                ref={ref}
                imageSrc={imageSrc ?? ''}
                onCropComplete={handleCropComplete}
                aspect={aspect}
                cropShape={cropShape}
            />
        );
    }, [handleCropComplete, aspect, cropShape, imageSrc]);

    return {
        Cropper: CropperComponent,
        loadImage,
        saveCroppedImage: save,
        imageSrc,
        croppedFile,
        previewUrl,
    };
};
