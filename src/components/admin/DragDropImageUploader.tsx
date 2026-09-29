'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  GripVertical,
  Star,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DragDropImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function DragDropImageUploader({
  images,
  onChange,
  maxImages = 8,
}: DragDropImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDropzoneActive, setIsDropzoneActive] = useState(false);

  // Handle uploading files from computer via /api/upload
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));

    if (fileArray.length === 0) {
      toast({
        title: 'Invalid Files',
        description: 'Please select valid image files (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    if (images.length + fileArray.length > maxImages) {
      toast({
        title: 'Limit Exceeded',
        description: `You can upload up to ${maxImages} images per article.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to upload images.');
      }

      const newUrls: string[] = json.data?.urls || [];
      onChange([...images, ...newUrls]);

      toast({
        title: 'Images Uploaded',
        description: `Successfully added ${newUrls.length} photo(s). Drag them to reorder.`,
      });
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Error occurred while uploading files.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Reorder logic on Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or custom drag preview compatibility
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...images];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Remove image
  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  // Set as Cover (move to index 0)
  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const [movedItem] = reordered.splice(index, 1);
    reordered.unshift(movedItem);
    onChange(reordered);
  };

  // Move one step left / right
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const reordered = [...images];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
            Article Photos & Gallery <span className="text-[#7E153A]">*</span>
          </label>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Upload from computer. Click & drag images to arrange. The 1st photo is used as the cover.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-500 font-mono bg-gray-100 px-2.5 py-1 rounded-full">
          {images.length} / {maxImages} Photos
        </span>
      </div>

      {/* Main Drag-and-Drop Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropzoneActive(true);
        }}
        onDragLeave={() => setIsDropzoneActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDropzoneActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          isDropzoneActive
            ? 'border-[#7E153A] bg-red-50/60 ring-2 ring-[#7E153A]/20 scale-[0.99]'
            : 'border-gray-200 hover:border-[#7E153A]/50 bg-stone-50/50 hover:bg-stone-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files);
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center shadow-xs">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div>
          <p className="text-sm font-extrabold text-gray-900">
            {uploading ? 'Uploading High-Resolution Images...' : 'Click or Drop Photos Here to Upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, or WEBP up to 10MB each. Supports multiple file selection.
          </p>
        </div>

        <Button
          type="button"
          disabled={uploading}
          variant="outline"
          size="sm"
          className="rounded-xl border-[#7E153A] text-[#7E153A] hover:bg-red-50 text-xs font-bold px-4"
        >
          {uploading ? 'Processing...' : 'Browse Local Files'}
        </Button>
      </div>

      {/* Reorderable Image Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="font-semibold flex items-center gap-1.5">
              <GripVertical size={14} className="text-gray-400" />
              Drag cards to reorder sequence:
            </span>
            <span className="text-[11px] text-[#7E153A] font-bold">
              ★ Slot 1 is Primary Cover
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {images.map((url, idx) => {
              const isCover = idx === 0;
              const isDragging = draggedIndex === idx;
              const isHovered = dragOverIndex === idx && !isDragging;

              return (
                <div
                  key={`${url}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-150 select-none shadow-xs ${
                    isCover
                      ? 'border-[#7E153A] ring-2 ring-[#7E153A]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isDragging ? 'opacity-30 scale-95 border-dashed border-red-400' : ''} ${
                    isHovered ? 'ring-2 ring-[#7E153A] scale-[1.02]' : ''
                  }`}
                >
                  {/* Aspect Ratio Container */}
                  <div className="aspect-3/4 relative overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing">
                    <img
                      src={url}
                      alt={`Article Photo ${idx + 1}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />

                    {/* Top Badges Overlay */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                      {isCover ? (
                        <span className="bg-[#7E153A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                          <Star size={10} fill="currentColor" /> Cover
                        </span>
                      ) : (
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          #{idx + 1}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>

                    {/* Drag Handle Indicator */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <GripVertical size={12} /> Drag to Reorder
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-[11px]">
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(idx)}
                        className="text-[10px] font-bold text-[#7E153A] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Star size={10} /> Set Cover
                      </button>
                    ) : (
                      <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Main Display
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'left')}
                          className="w-5 h-5 rounded hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer"
                          title="Move left"
                        >
                          <ArrowLeft size={11} />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'right')}
                          className="w-5 h-5 rounded hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer"
                          title="Move right"
                        >
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
