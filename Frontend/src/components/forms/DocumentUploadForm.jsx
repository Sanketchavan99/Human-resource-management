import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import FileUpload from '../ui/FileUpload';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';

/* ------------------------------ Main Component ------------------------------ */

const DocumentUploadForm = ({ onSave, onSkip, onBack, loading }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState({
        aadhar: null,
        panCard: null,
        drivingLicense: null,
        educationDoc: null,
        passportPhoto: null,
        passbook: null,
        cheque: null,
    });
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch existing documents on mount
    useEffect(() => {
        const fetchDocuments = async () => {
            if (!user?.id) return;

            setFetchLoading(true);
            try {
                const response = await userService.getMyDocuments();
                if (response?.data?.success) {
                    setExistingDocuments(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchDocuments();
    }, [user]);

    const handleFileSelect = (field, file) => {
        setFiles(prev => ({ ...prev, [field]: file }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await userService.downloadDocument(filename);
            if (response?.data) {
                // Create a blob URL and trigger download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if uploading new documents or just proceeding
        const hasNewFiles = Object.values(files).some(file => file !== null);
        const hasExistingDocs = existingDocuments.length > 0;

        // If no new files and no existing documents, require at least Aadhar and PAN
        if (!hasNewFiles && !hasExistingDocs) {
            const newErrors = {};
            if (!files.aadhar) newErrors.aadhar = 'Aadhar card is required';
            if (!files.panCard) newErrors.panCard = 'PAN card is required';

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
        }

        // Only save if there are new files
        if (hasNewFiles) {
            onSave(files);
        } else if (hasExistingDocs) {
            // If documents already exist, just skip to next
            onSkip();
        }
    };

    const getDocumentLabel = (type) => {
        const labels = {
            aadhar: 'Aadhar Card',
            panCard: 'PAN Card',
            drivingLicense: 'Driving License',
            educationDoc: 'Education Certificate',
            passportPhoto: 'Passport Photo',
            passbook: 'Bank Passbook',
            cheque: 'Cancelled Cheque'
        };
        return labels[type] || type;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Existing Documents Section */}
            {existingDocuments.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingDocuments.map((doc, index) => (
                            <Card key={index} className="shadow-sm">
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                icon="mdi:file-document"
                                                className="text-2xl text-primary"
                                            />
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {getDocumentLabel(doc.type)}
                                                </p>
                                                <p className="text-xs text-default-500 truncate max-w-[150px]">
                                                    {doc.filename}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            onClick={() => handleDownload(doc.filename)}
                                        >
                                            <Icon icon="mdi:download" className="text-xl" />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                    <p className="text-sm text-default-500 mt-3">
                        Upload new documents below to replace existing ones.
                    </p>
                </div>
            )}

            {/* Upload New Documents Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    {existingDocuments.length > 0 ? 'Update Documents (Optional)' : 'Upload Documents'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Aadhar Card */}
                    <div>
                        <FileUpload
                            label={`Aadhar Card ${existingDocuments.length === 0 ? '*' : ''}`}
                            accept="image/*,.pdf"
                            onFileSelect={(file) => handleFileSelect('aadhar', file)}
                            error={errors.aadhar}
                            helperText="Upload Aadhar card (Image or PDF, max 5MB)"
                        />
                    </div>

                    {/* PAN Card */}
                    <div>
                        <FileUpload
                            label={`PAN Card ${existingDocuments.length === 0 ? '*' : ''}`}
                            accept="image/*,.pdf"
                            onFileSelect={(file) => handleFileSelect('panCard', file)}
                            error={errors.panCard}
                            helperText="Upload PAN card (Image or PDF, max 5MB)"
                        />
                    </div>

                    {/* Driving License */}
                    <div>
                        <FileUpload
                            label="Driving License"
                            accept="image/*,.pdf"
                            onFileSelect={(file) => handleFileSelect('drivingLicense', file)}
                            error={errors.drivingLicense}
                            helperText="Upload Driving License (Optional)"
                        />
                    </div>

                    {/* Education Certificate */}
                    <div>
                        <FileUpload
                            label="Education Certificate"
                            accept="image/*,.pdf"
                            onFileSelect={(file) => handleFileSelect('educationDoc', file)}
                            error={errors.educationDoc}
                            helperText="Upload highest qualification certificate"
                        />
                    </div>

                    {/* Passport Size Photo */}
                    <div>
                        <FileUpload
                            label="Passport Size Photo"
                            accept="image/*"
                            onFileSelect={(file) => handleFileSelect('passportPhoto', file)}
                            error={errors.passportPhoto}
                            helperText="Upload recent passport size photo"
                        />
                    </div>

                    {/* Bank Passbook */}
                    <div>
                        <FileUpload
                            label="Bank Passbook"
                            accept="image/*,.pdf"
                            onFileSelect={(file) => handleFileSelect('passbook', file)}
                            error={errors.passbook}
                            helperText="Upload front page of bank passbook"
                        />
                    </div>

                    {/* Cancelled Cheque */}
                    <div>
                        <FileUpload
                            label="Cancelled Cheque"
                            accept="image/*,.pdf"
                            onFileSelect={(file) => handleFileSelect('cheque', file)}
                            error={errors.cheque}
                            helperText="Upload cancelled cheque leaf"
                        />
                    </div>
                </div>
            </div>

            {/* ----------------------------- Form Actions ----------------------------- */}
            <div className="flex flex-col gap-3 mt-6 sm:mt-8 sm:flex-row sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    isDisabled={loading}
                    startContent={<Icon icon="lucide:arrow-left" className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                >
                    Back
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant="flat"
                        size="sm"
                        onClick={onSkip}
                        isDisabled={loading}
                        className="flex-1 sm:flex-none"
                    >
                        Skip
                    </Button>
                    <Button
                        color="primary"
                        size="sm"
                        type="submit"
                        isLoading={loading || fetchLoading}
                        endContent={!(loading || fetchLoading) && <Icon icon="lucide:check" className="h-4 w-4" />}
                        className="flex-1 sm:flex-none"
                    >
                        {Object.values(files).some(f => f !== null)
                            ? 'Upload & Complete'
                            : 'Complete Profile'
                        }
                    </Button>
                </div>
            </div>
        </form >
    );
};

export default DocumentUploadForm;
