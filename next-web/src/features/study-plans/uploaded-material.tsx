"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  File,
  Files,
  FileText,
  Image,
  Upload,
  WandSparkles,
} from "lucide-react";
import { useState } from "react";

export const UploadedMaterial = () => {
  const [hasUploadedFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);
    // File drop logic would go here
  };

  const handleFileSelect = (e: any) => {
    e.preventDefault();
  };
  // File selection logic would go here
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1">
            <Files className="w-5 h-5" />
            <span className="text-xl">Uploaded material</span>
          </div>
          <div className="flex items-center gap-2">
            {hasUploadedFiles && (
              <Button variant="outline">
                <Upload />
                Upload Material
              </Button>
            )}

            <Button
              variant={!hasUploadedFiles ? "outline" : "secondary"}
              disabled={!hasUploadedFiles}
            >
              <WandSparkles />
              Analyze
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasUploadedFiles ? (
          <div className="space-y-6">
            {/* Beautiful Drag & Drop Upload Section */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-background"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isDragOver
                    ? "Drop your files here!"
                    : "Upload Study Material"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Drag and drop your files here, or{" "}
                  <span className="text-secondary-foreground font-medium">
                    browse files
                  </span>
                </p>
              </div>

              {/* File Type Icons */}
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-200">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">PDF</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-200">
                  <Image className="w-5 h-5" />
                  <span className="text-sm">Images</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-200">
                  <File className="w-5 h-5" />
                  <span className="text-sm">Documents</span>
                </div>
              </div>

              {/* Upload Button */}
              <div className="space-y-3">
                <Button className="px-6 py-3" variant="secondary">
                  <Upload className="w-4 h-4" />
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  Maximum file size: 50MB • Supported formats: PDF, DOC, DOCX,
                  TXT, JPG, PNG
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
};
