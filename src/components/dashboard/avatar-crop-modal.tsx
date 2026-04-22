"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface AvatarCropModalProps {
  imageSrc: string;
  onCropped: (blob: Blob) => void;
  onCancel: () => void;
}

export function AvatarCropModal({ imageSrc, onCropped, onCancel }: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    setCrop({
      unit: "px",
      x,
      y,
      width: size,
      height: size,
    });
  }, []);

  async function handleCrop() {
    const image = imgRef.current;
    if (!image) return;

    const pixelCrop = crop as PixelCrop;
    const canvas = document.createElement("canvas");
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    canvas.toBlob(
      (blob) => {
        if (blob) onCropped(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--color-secondary-2)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-font)]">Crop Profile Picture</h3>

        <div className="flex justify-center overflow-hidden rounded-lg bg-[var(--color-secondary-3)]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1}
            circularCrop
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[60vh] w-auto"
            />
          </ReactCrop>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-font)]/60 transition-colors hover:text-[var(--color-font)]"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-6 py-2 font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}