import React, { useState, useRef } from 'react';
import { Button, Card, CardBody, Progress } from '@heroui/react';
import { Icon } from '@iconify/react';
import { userService } from '@/services';

const ExcelUpload = ({ onUploadSuccess }) => {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState('');

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
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
            setError('Please upload a valid Excel file (.xlsx or .xls)');
            return false;
        }
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError('');
        setUploadResult(null);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        setError('');
        setUploadResult(null);

        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const response = await userService.bulkUploadUsers(file);

            if (response.data?.success) {
                setUploadResult(response.data.results || { success: 0, failed: 0, errors: [] });
                if (onUploadSuccess) onUploadSuccess();
                setFile(null);
                if (inputRef.current) inputRef.current.value = '';
            } else {
                setError(response.data?.message || 'Upload failed');
            }
        } catch (err) {
            setError('An unexpected error occurred during upload');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
        setUploadResult(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="border border-default-200 shadow-sm">
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Bulk Upload Employees</h3>

                    {!file && !uploadResult ? (
                        <div
                            className={`
                relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
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
                                accept=".xlsx, .xls"
                                onChange={handleChange}
                            />

                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-4 rounded-full bg-success/10 text-success">
                                    <Icon icon="lucide:sheet" width="32" height="32" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium">Drag & drop Excel file here</p>
                                    <p className="text-sm text-default-500 mt-1">or click to browse</p>
                                </div>
                                <div className="text-xs text-default-400 mt-2">
                                    Supported formats: .xlsx, .xls
                                </div>
                            </div>
                        </div>
                    ) : file ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg bg-default-50">
                                <div className="flex items-center gap-3">
                                    <Icon icon="lucide:file-spreadsheet" className="text-success" width="24" height="24" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-default-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                {!uploading && (
                                    <Button isIconOnly variant="light" color="danger" onClick={removeFile}>
                                        <Icon icon="lucide:x" width="20" height="20" />
                                    </Button>
                                )}
                            </div>

                            {uploading && (
                                <div className="space-y-2">
                                    <Progress size="sm" isIndeterminate aria-label="Uploading..." className="max-w-full" />
                                    <p className="text-xs text-center text-default-500">Uploading and processing data...</p>
                                </div>
                            )}

                            {!uploading && (
                                <div className="flex justify-end gap-3">
                                    <Button variant="flat" onClick={removeFile}>Cancel</Button>
                                    <Button color="primary" onClick={handleUpload}>Upload Data</Button>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-danger/10 text-danger text-sm flex items-center gap-2">
                            <Icon icon="lucide:alert-circle" width="16" height="16" />
                            {error}
                        </div>
                    )}

                    {uploadResult && (
                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                                    <p className="text-sm text-success-600 font-medium">Successful</p>
                                    <p className="text-2xl font-bold text-success">{uploadResult.success}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                                    <p className="text-sm text-danger-600 font-medium">Failed</p>
                                    <p className="text-2xl font-bold text-danger">{uploadResult.failed}</p>
                                </div>
                            </div>

                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div className="p-4 rounded-lg bg-default-100 max-h-40 overflow-y-auto">
                                    <p className="text-sm font-medium mb-2">Error Details:</p>
                                    <ul className="list-disc list-inside text-xs text-danger space-y-1">
                                        {uploadResult.errors.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Button className="w-full" color="primary" variant="flat" onClick={() => setUploadResult(null)}>
                                Upload Another File
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default ExcelUpload;
