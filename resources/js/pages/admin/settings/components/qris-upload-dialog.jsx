import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { X, Upload, Crop as CropIcon } from 'lucide-react';
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function QrisUploadDialog({ open, onOpenChange, onSave, onCancel }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [isImageTooSmall, setIsImageTooSmall] = useState(false);
    const [scaledImageSrc, setScaledImageSrc] = useState(null);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const scaleCanvasRef = useRef(null);

    const MIN_SIZE = 200; // Minimum size for QRIS images

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result);
                setIsImageTooSmall(false);
                setScaledImageSrc(null);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const scaleImageIfNeeded = (img) => {
        const { width, height } = img;
        const minDimension = Math.min(width, height);
        
        if (minDimension < MIN_SIZE) {
            const scale = MIN_SIZE / minDimension;
            const newWidth = width * scale;
            const newHeight = height * scale;
            
            const canvas = scaleCanvasRef.current;
            if (!canvas) return img;
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            const scaledSrc = canvas.toDataURL('image/jpeg', 0.95);
            setScaledImageSrc(scaledSrc);
            setIsImageTooSmall(true);
            
            // Create new image object with scaled dimensions
            const scaledImg = new Image();
            scaledImg.src = scaledSrc;
            return scaledImg;
        }
        
        return img;
    };

    const onImageLoad = (e) => {
        const img = e.currentTarget;
        const { width, height } = img;
        
        setImageDimensions({ width, height });
        
        // Scale image if too small
        const processedImg = scaleImageIfNeeded(img);
        
        // Use scaled dimensions if image was scaled
        const actualWidth = scaledImageSrc ? MIN_SIZE : width;
        const actualHeight = scaledImageSrc ? MIN_SIZE : height;
        
        const imageAspect = actualWidth / actualHeight;
        const targetAspect = 1 / 1; // 1:1 ratio for QRIS
        
        let initialCrop;
        
        if (imageAspect > targetAspect) {
            // Image is wider than 1:1, use full height
            const cropWidth = actualHeight * targetAspect;
            initialCrop = {
                unit: 'px',
                width: cropWidth,
                height: actualHeight,
                x: (actualWidth - cropWidth) / 2, // Center horizontally
                y: 0,
            };
        } else {
            // Image is taller than 1:1, use full width
            const cropHeight = actualWidth / targetAspect;
            initialCrop = {
                unit: 'px',
                width: actualWidth,
                height: cropHeight,
                x: 0,
                y: (actualHeight - cropHeight) / 2, // Center vertically
            };
        }
        
        setCrop(initialCrop);
    };

    const generateCroppedImage = useCallback(async () => {
        if (!completedCrop || !imgRef.current || !canvasRef.current) {
            return null;
        }

        setIsProcessing(true);

        const image = imgRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setIsProcessing(false);
            return null;
        }

        // Use actual image dimensions for scaling
        const actualWidth = scaledImageSrc ? MIN_SIZE : image.naturalWidth;
        const actualHeight = scaledImageSrc ? MIN_SIZE : image.naturalHeight;
        const displayWidth = scaledImageSrc ? MIN_SIZE : image.width;
        const displayHeight = scaledImageSrc ? MIN_SIZE : image.height;
        
        const scaleX = actualWidth / displayWidth;
        const scaleY = actualHeight / displayHeight;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Convert canvas to blob
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    setIsProcessing(false);
                    resolve(blob);
                },
                'image/jpeg',
                0.95
            );
        });
    }, [completedCrop, scaledImageSrc]);

    const handleSave = async () => {
        if (!selectedImage) {
            return;
        }

        if (completedCrop) {
            const croppedBlob = await generateCroppedImage();
            if (croppedBlob) {
                // Convert blob to file
                const file = new File([croppedBlob], 'qris-image.jpg', {
                    type: 'image/jpeg',
                });
                onSave(file);
            }
        } else {
            // If no crop, use original image
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            const file = new File([blob], 'qris-image.jpg', {
                type: 'image/jpeg',
            });
            onSave(file);
        }
    };

    const handleCancel = () => {
        // Reset state
        setSelectedImage(null);
        setCrop(null);
        setCompletedCrop(null);
        setImageDimensions({ width: 0, height: 0 });
        setIsImageTooSmall(false);
        setScaledImageSrc(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onCancel();
    };

    const handleClose = () => {
        handleCancel();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl w-full bg-white p-0 max-h-[90vh] flex flex-col">
                <DialogHeader className="border-b px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            Upload & Crop QRIS Image
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="px-6 py-6 flex-1 overflow-y-auto">
                    {!selectedImage ? (
                        // Upload Area
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-gray-900">
                                        Upload QRIS image here
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Supports: JPEG, PNG, JPG (Max 2MB)
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose File
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Crop Area
                        <div className="space-y-4">
                            {isImageTooSmall && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                            <span className="text-yellow-900 text-xs font-bold">!</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-yellow-800 font-medium">
                                                Gambar terlalu kecil, telah diperbesar secara otomatis
                                            </p>
                                            <p className="text-xs text-yellow-600 mt-1">
                                                Ukuran asli: {imageDimensions.width}x{imageDimensions.height}px → Diperbesar ke: {MIN_SIZE}x{MIN_SIZE}px
                                            </p>
                                            <p className="text-xs text-yellow-600">
                                                Kualitas mungkin berkurang. Disarankan menggunakan gambar minimal {MIN_SIZE}x{MIN_SIZE}px.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CropIcon className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Crop your QRIS image (1:1 ratio)
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose Different Image
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex justify-center">
                                <div className="w-full">
                                    <ReactCrop
                                        className='w-full'
                                        crop={crop}
                                        onChange={(_, pixelCrop) => setCrop(pixelCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={1 / 1} // 1:1 aspect ratio for QRIS
                                        keepSelection
                                        minWidth={10}
                                        minHeight={10}
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop me"
                                            src={scaledImageSrc || selectedImage}
                                            onLoad={onImageLoad}
                                            className="max-w-full h-auto"
                                            style={{
                                                maxWidth: scaledImageSrc ? `${MIN_SIZE}px` : 'none',
                                                height: scaledImageSrc ? `${MIN_SIZE}px` : 'auto'
                                            }}
                                        />
                                    </ReactCrop>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t px-6 py-4">
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!selectedImage || isProcessing}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isProcessing ? 'Processing...' : 'Save QRIS Image'}
                        </Button>
                    </div>
                </DialogFooter>

                {/* Hidden canvas for image processing */}
                <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                />
                {/* Hidden canvas for image scaling */}
                <canvas
                    ref={scaleCanvasRef}
                    style={{ display: 'none' }}
                />
            </DialogContent>
        </Dialog>
    );
}