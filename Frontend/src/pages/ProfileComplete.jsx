import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/ui/StepIndicator';
import PersonalDetailsForm from '../components/forms/PersonalDetailsForm';
import AddressForm from '../components/forms/AddressForm';
import BankDetailsForm from '../components/forms/BankDetailsForm';
import EmergencyContactForm from '../components/forms/EmergencyContactForm';
import FamilyMemberForm from '../components/forms/FamilyMemberForm';
import NomineeForm from '../components/forms/NomineeForm';
import DocumentUploadForm from '../components/forms/DocumentUploadForm';

// Import services
import {
    userService,
    bankDetailService,
    emergencyContactService
} from '../services';

const STEPS = [
    { title: 'Personal Details', component: PersonalDetailsForm },
    { title: 'Address', component: AddressForm },
    { title: 'Bank Details', component: BankDetailsForm },
    { title: 'Emergency Contact', component: EmergencyContactForm },
    { title: 'Family Members', component: FamilyMemberForm },
    { title: 'Nominees', component: NomineeForm },
    { title: 'Documents', component: DocumentUploadForm },
];

const ProfileComplete = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            // Final step completion logic
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSavePersonalDetails = async (data) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await userService.updateUser(user.id, data);
            if (response.data?.success) {
                handleNext();
            } else {
                console.error('Failed to update user:', response.data?.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBankDetails = async (data) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const bankData = { ...data, userId: user.id };
            const response = await bankDetailService.createBankDetail(bankData);
            if (response.data?.success) {
                handleNext();
            } else {
                console.error('Failed to create bank details:', response.data?.message);
            }
        } catch (error) {
            console.error('Error creating bank details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEmergencyContact = async (data) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            console.log(data);
            const contactData = { ...data, userId: user.id };
            const response = await emergencyContactService.createEmergencyContact(contactData);
            if (response.data?.success) {
                handleNext();
            } else {
                console.error('Failed to create emergency contact:', response.data?.message);
            }
        } catch (error) {
            console.error('Error creating emergency contact:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDocuments = async (files) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await userService.uploadDocuments(user.id, files);
            if (response.data?.success) {
                navigate('/dashboard');
            } else {
                console.error('Failed to upload documents:', response.data?.message);
            }
        } catch (error) {
            console.error('Error uploading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        const StepComponent = STEPS[currentStep].component;

        const commonProps = {
            onBack: handleBack,
            loading: loading,
        };

        switch (currentStep) {
            case 0: // Personal Details
                return <StepComponent onSave={handleSavePersonalDetails} onNext={null} {...commonProps} />;
            case 1: // Address
                return <StepComponent onSkip={handleNext} {...commonProps} />;
            case 2: // Bank Details
                return <StepComponent onSave={handleSaveBankDetails} onNext={handleNext} onSkip={handleNext} {...commonProps} />;
            case 3: // Emergency Contact
                return <StepComponent onSave={handleSaveEmergencyContact} onNext={handleNext} onSkip={handleNext} {...commonProps} />;
            case 4: // Family Members
                return <StepComponent onSkip={handleNext} {...commonProps} />;
            case 5: // Nominees
                return <StepComponent onSkip={handleNext} {...commonProps} />;
            case 6: // Documents
                return <StepComponent onSave={handleSaveDocuments} onSkip={() => navigate('/dashboard')} {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-default-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
                {/* ------------------------------ Page Header ------------------------------ */}
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-lg font-semibold text-foreground leading-tight sm:text-xl">
                        Complete Your Profile
                    </h1>
                    <p className="text-xs text-default-500 mt-1 sm:text-sm">
                        Please provide all necessary information to complete your registration.
                    </p>
                </header>

                <StepIndicator steps={STEPS} currentStep={currentStep} />

                <div className="mt-6 sm:mt-8">
                    <Card className="border border-default-200 shadow-sm rounded-xl">
                        <CardHeader className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
                            <h2 className="text-base font-semibold text-foreground sm:text-lg">
                                {STEPS[currentStep].title}
                            </h2>
                        </CardHeader>
                        <CardBody className="px-5 py-4 sm:px-6 sm:py-5">
                            {renderStepContent()}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfileComplete;
