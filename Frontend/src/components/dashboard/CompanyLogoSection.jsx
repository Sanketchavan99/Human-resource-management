import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Spinner, Image, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import companyService from '../../services/companyService';

const CompanyLogoSection = ({ company, onLogoUpdated }) => {
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const navigate = useNavigate();

    const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            addToast({
                title: 'Error',
                description: 'Please upload a valid image file (JPG, PNG)',
                color: 'danger',
            });
            return;
        }

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await companyService.uploadCompanyLogo(formData);
            if (response?.data?.success) {
                addToast({
                    title: 'Success',
                    description: 'Logo uploaded successfully',
                    color: 'success',
                });

                // Notify parent component if callback provided
                if (onLogoUpdated) {
                    onLogoUpdated();
                }

                // Refresh page to show new logo everywhere
                setTimeout(() => navigate(0), 1000);
            } else {
                addToast({
                    title: 'Error',
                    description: 'Error uploading logo',
                    color: 'danger',
                });
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            addToast({
                title: 'Error',
                description: 'Error uploading logo',
                color: 'danger',
            });
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <h3 className="text-lg font-semibold">Company Logo</h3>
            </CardHeader>
            <CardBody>
                <div className="flex items-center gap-6">
                    {company?.logoPath ? (
                        <Image
                            src={`${import.meta.env.VITE_API_URL}/${company.logoPath}`}
                            alt={company.name}
                            className="h-24 w-24 object-contain border-2 border-default-200 rounded-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-lg bg-default-100 flex items-center justify-center border-2 border-default-200">
                            <Icon icon="lucide:building-2" width="40" height="40" className="text-default-400" />
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-default-500 mb-3">
                            Upload your company logo. Recommended size: 200x200px
                        </p>
                        <input
                            type="file"
                            id="logo-upload"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <Button
                            color="primary"
                            variant="flat"
                            startContent={uploadingLogo ? <Spinner size="sm" /> : <Icon icon="lucide:upload" />}
                            onClick={() => document.getElementById('logo-upload').click()}
                            isDisabled={uploadingLogo}
                        >
                            {uploadingLogo ? 'Uploading...' : company?.logoPath ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default CompanyLogoSection;
