import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Label } from "@/shared/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  RotateCcw,
  RotateCw,
  Maximize,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedFile: File) => void;
  fileName?: string;
  defaultAspect?: number;
}

/**
 * ImageCropModal Component
 * Modal for cropping, rotating, and scaling images
 * Uses react-image-crop library
 */
export const ImageCropModal = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  fileName = "cropped-image.jpg",
  defaultAspect = 1, // Default to square for avatars
}: ImageCropModalProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(defaultAspect);
  
  // Live preview URLs
  const [previewUrls, setPreviewUrls] = useState<{
    avatar: string | null;
    profile: string | null;
  }>({ avatar: null, profile: null });

  // Set aspect ratio with centered crop
  const setAspectRatio = useCallback((aspectRatio: number | undefined) => {
    setAspect(aspectRatio);

    if (aspectRatio && imgRef.current) {
      const { width, height } = imgRef.current;
      const imageAspect = width / height;
      let cropWidth = 50;
      let cropHeight = 50;

      if (aspectRatio > imageAspect) {
        cropWidth = 90;
        cropHeight = 90 / aspectRatio;
      } else {
        cropHeight = 90;
        cropWidth = 90 * aspectRatio;
      }

      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: cropWidth,
            height: cropHeight,
          },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      );

      setCrop(newCrop);
    }
  }, []);

  // Generate cropped image
  const generateCroppedImage = useCallback(
    async (
      image: HTMLImageElement,
      crop: PixelCrop,
      scale: number,
      rotate: number
    ): Promise<Blob | null> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropWidthNatural = crop.width * scaleX;
      const cropHeightNatural = crop.height * scaleY;

      const scaledWidth = cropWidthNatural;
      const scaledHeight = cropHeightNatural;

      let canvasWidth = scaledWidth;
      let canvasHeight = scaledHeight;

      if (rotate !== 0 && rotate % 360 !== 0) {
        const rotateRads = (rotate * Math.PI) / 180;
        const rotatedWidth =
          Math.abs(Math.cos(rotateRads) * scaledWidth) +
          Math.abs(Math.sin(rotateRads) * scaledHeight);
        const rotatedHeight =
          Math.abs(Math.sin(rotateRads) * scaledWidth) +
          Math.abs(Math.cos(rotateRads) * scaledHeight);

        canvasWidth = rotatedWidth;
        canvasHeight = rotatedHeight;
      }

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * pixelRatio;
      canvas.height = canvasHeight * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";
      ctx.imageSmoothingEnabled = true;

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-scaledWidth / 2, -scaledHeight / 2);

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidthNatural,
        cropHeightNatural,
        0,
        0,
        scaledWidth,
        scaledHeight
      );

      ctx.restore();

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.95
        );
      });
    },
    []
  );
  
  // Generate preview URL from cropped image
  const generatePreviewUrl = useCallback(
    async (
      image: HTMLImageElement,
      crop: PixelCrop,
      scale: number,
      rotate: number
    ): Promise<string | null> => {
      const blob = await generateCroppedImage(image, crop, scale, rotate);
      if (!blob) return null;
      return URL.createObjectURL(blob);
    },
    [generateCroppedImage]
  );

  // Update previews when crop changes
  useEffect(() => {
    async function updatePreviews() {
      if (completedCrop && imgRef.current) {
        try {
          const previewUrl = await generatePreviewUrl(
            imgRef.current,
            completedCrop,
            scale,
            rotate
          );

          if (previewUrl) {
            // Clean up old preview URLs
            if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
            if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
            
            // Use the same preview URL for both avatar and profile
            setPreviewUrls({
              avatar: previewUrl,
              profile: previewUrl,
            });
          }
        } catch (error) {
          console.error("Error generating preview:", error);
        }
      }
    }

    updatePreviews();
    
    // Cleanup function
    return () => {
      if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
      if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
    };
  }, [completedCrop, scale, rotate, generatePreviewUrl]);

  // Apply crop and close modal
  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      const blob = await generateCroppedImage(
        imgRef.current,
        completedCrop,
        scale,
        rotate
      );

      if (blob) {
        const file = new File([blob], fileName, { type: "image/jpeg" });
        
        // Clean up preview URLs
        if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
        if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
        setPreviewUrls({ avatar: null, profile: null });
        
        onCropComplete(file);
        onClose();
      }
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  };

  // Reset transforms and crop
  const resetTransforms = () => {
    setScale(1);
    setRotate(0);
    
    // Reset crop to center
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          aspect || 1,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    }
  };

  // Handle image load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect || 1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
    
    // Set completedCrop immediately so previews appear
    const pixelCrop: PixelCrop = {
      unit: "px",
      width: (crop.width * width) / 100,
      height: (crop.height * height) / 100,
      x: (crop.x * width) / 100,
      y: (crop.y * height) / 100,
    };
    setCompletedCrop(pixelCrop);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Crop and Adjust Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area, rotation, and scale of your image
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 overflow-hidden h-[calc(90vh-180px)]">
          {/* Left side - Crop area and controls */}
          <div className="flex-[3] space-y-4 overflow-y-auto pr-2 min-w-0">
            {/* Aspect Ratio Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAspectRatio(16 / 9)}
              >
                <RectangleHorizontal className="mr-2 size-4" />
                16:9
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAspectRatio(4 / 3)}
              >
                <RectangleHorizontal className="mr-2 size-4" />
                4:3
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAspectRatio(1)}
              >
                <Square className="mr-2 size-4" />
                1:1
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAspectRatio(3 / 4)}
              >
                <RectangleVertical className="mr-2 size-4" />
                3:4
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAspectRatio(undefined)}
              >
                <Maximize className="mr-2 size-4" />
                Free
              </Button>
            </div>

            {/* Crop Area */}
            <div className="flex justify-center items-center bg-muted p-4 rounded-lg min-h-[400px] md:min-h-[500px]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  crossOrigin="anonymous"
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxHeight: "60vh",
                    maxWidth: "100%",
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center gap-4">
              <Label className="min-w-[80px]">Rotation:</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotate((r) => r - 90)}
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotate((r) => r + 90)}
              >
                <RotateCw className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{rotate}°</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetTransforms}
              >
                Reset
              </Button>
            </div>

            {/* Scale Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Scale: {scale.toFixed(2)}x</Label>
              </div>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Right side - Live previews */}
          <div className="flex-1 space-y-6 overflow-y-auto min-w-[200px]">
            {completedCrop && (
              <>
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Live Previews
                  </Label>
                  
                  {/* Avatar Preview */}
                  <div className="space-y-2 mb-6">
                    <Label className="text-sm text-muted-foreground">
                      Avatar Preview:
                    </Label>
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={previewUrls.avatar || undefined} 
                        alt="Avatar preview" 
                      />
                      <AvatarFallback>Preview</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Profile Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Profile Preview:
                    </Label>
                    <div className="w-[200px] h-[200px] rounded-lg overflow-hidden border border-border">
                      {previewUrls.profile ? (
                        <img
                          src={previewUrls.profile}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          Preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApplyCrop}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
