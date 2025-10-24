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

export default function ImageUploadDialog({ open, onOpenChange, onSave, onCancel }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setSelectedImage(reader.result)
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const imageAspect = width / height;
        const targetAspect = 4 / 1; // 4:1 ratio
        
        let initialCrop;
        
        if (imageAspect > targetAspect) {
            // Image is wider than 4:1, use full height
            const cropWidth = height * targetAspect;
            initialCrop = {
                unit: 'px',
                width: cropWidth,
                height: height,
                x: (width - cropWidth) / 2, // Center horizontally
                y: 0,
            };
        } else {
            // Image is taller than 4:1, use full width
            const cropHeight = width / targetAspect;
            initialCrop = {
                unit: 'px',
                width: width,
                height: cropHeight,
                x: 0,
                y: (height - cropHeight) / 2, // Center vertically
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

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

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
    }, [completedCrop]);

    const handleSave = async () => {
        if (!selectedImage) {
            return;
        }

        if (completedCrop) {
            const croppedBlob = await generateCroppedImage();
            if (croppedBlob) {
                // Convert blob to file
                const file = new File([croppedBlob], 'carousel-image.jpg', {
                    type: 'image/jpeg',
                });
                onSave(file);
            }
        } else {
            // If no crop, use original image
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            const file = new File([blob], 'carousel-image.jpg', {
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
            <DialogContent className="max-w-5xl w-full bg-white p-0 max-h-[90vh] flex flex-col">
                <DialogHeader className="border-b px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            Upload & Crop Carousel Image
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
                                        Upload your image here
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Supports: JPEG, PNG, JPG, GIF (Max 2MB)
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CropIcon className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Crop your image (4:1 ratio)
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
                                        aspect={4 / 1} // 4:1 aspect ratio
                                        keepSelection
                                        minWidth={10}
                                        minHeight={10}
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop me"
                                            src={selectedImage}
                                            onLoad={onImageLoad}
                                            className="max-w-full h-auto"
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
                            {isProcessing ? 'Processing...' : 'Save Image'}
                        </Button>
                    </div>
                </DialogFooter>

                {/* Hidden canvas for image processing */}
                <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                />
            </DialogContent>
        </Dialog>
    );
}
