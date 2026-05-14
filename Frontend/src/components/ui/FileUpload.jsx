import React, { useRef, useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

/**
 * FileUpload Component
 * Reusable file upload component with drag-and-drop support
 */
const FileUpload = ({
    label,
    accept = "image/*,.pdf",
    maxSize = 5, // MB
    onFileSelect,
    error,
    helperText
}) => {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        if (!file) return false;

        // Check size
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size must be less than ${maxSize}MB`);
            return false;
        }

        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium mb-2">{label}</label>}

            {!selectedFile ? (
                <div
                    className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-default-300 hover:border-default-400'}
            ${error ? 'border-danger' : ''}
          `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleChange}
                    />

                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 rounded-full bg-default-100 text-default-500">
                            <Icon icon="lucide:upload-cloud" width="24" height="24" />
                        </div>
                        <div className="text-sm text-default-600">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </div>
                        <div className="text-xs text-default-400">
                            {accept.replace(/,/g, ', ')} (Max {maxSize}MB)
                        </div>
                    </div>
                </div>
            ) : (
                <Card className="border border-default-200 shadow-sm">
                    <CardBody className="flex flex-row items-center justify-between p-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Icon icon="lucide:file-text" width="20" height="20" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                                <span className="text-xs text-default-400">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        </div>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={removeFile}
                        >
                            <Icon icon="lucide:x" width="18" height="18" />
                        </Button>
                    </CardBody>
                </Card>
            )}

            {error && <p className="text-xs text-danger mt-1">{error}</p>}
            {helperText && !error && <p className="text-xs text-default-400 mt-1">{helperText}</p>}
        </div>
    );
};

export default FileUpload;
