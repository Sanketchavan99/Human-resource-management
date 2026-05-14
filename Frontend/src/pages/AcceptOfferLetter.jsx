import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { offerLetterService } from '../services';
import { useAuth } from '../context/AuthContext';

const AcceptOfferLetter = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [loading, setLoading] = useState(true);
    const [offerLetter, setOfferLetter] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOfferLetter();
    }, []);

    const fetchOfferLetter = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await offerLetterService.getMyOfferLetter();
            if (response?.data?.success) {
                setOfferLetter(response.data.data);

                // If already accepted, redirect to dashboard
                if (response.data.data.accepted) {
                    navigate('/dashboard');
                }
            }
            else {
                if (response?.status === 404) {
                    addToast({
                        title: 'Offer Letter Not Found',
                        description: 'No offer letter found for this user.',
                        color: 'danger'
                    });
                    navigate('/dashboard');
                }
                else {
                    setError('Failed to load offer letter. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error fetching offer letter:', error);
            if (error.response?.status === 404) {
                // No offer letter, redirect to dashboard
                navigate('/dashboard');
            } else {
                setError('Failed to load offer letter. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await offerLetterService.downloadOfferLetter();
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = offerLetter?.filename || 'Offer-Letter.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading offer letter:', error);
            setError('Failed to download offer letter. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const handleAccept = () => {
        onOpen();
    };

    const confirmAccept = async () => {
        setAccepting(true);
        try {
            const response = await offerLetterService.acceptOfferLetter();
            if (response?.data?.success) {
                // Update user in auth context to reflect acceptance
                const updatedUser = {
                    ...user,
                    offerLetterAccepted: true,
                    offerLetterAcceptedAt: response.data.data.acceptedAt
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Close modal and redirect to dashboard
                onClose();
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error accepting offer letter:', error);
            setError('Failed to accept offer letter. Please try again.');
            onClose();
        } finally {
            setAccepting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (error && !offerLetter) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
                <Card className="max-w-md w-full">
                    <CardBody className="text-center p-8">
                        <Icon icon="lucide:alert-circle" className="h-16 w-16 text-danger mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
                        <p className="text-default-500 mb-4">{error}</p>
                        <Button color="primary" onPress={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-8">
            <Card className="max-w-3xl w-full shadow-2xl border border-default-200">
                {/* Header Section */}
                <CardHeader className="flex flex-col gap-3 px-6 pt-8 pb-6 bg-gradient-to-r from-primary-500 to-secondary-500">
                    <div className="flex items-center justify-center w-full">
                        <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                            <Icon icon="lucide:file-signature" className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Welcome to the Team!
                        </h1>
                        <p className="text-white/90 mt-2 text-sm sm:text-base">
                            Please review and accept your offer letter to continue
                        </p>
                    </div>
                </CardHeader>

                <CardBody className="px-6 py-8 space-y-6">
                    {/* Employee Info */}
                    <div className="bg-default-100 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Icon icon="lucide:user" className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-default-500">Employee Name</p>
                                <p className="text-sm font-semibold text-foreground">{offerLetter?.name || user?.name || 'N/A'}</p>
                            </div>
                        </div>
                        {offerLetter?.empCode && (
                            <div className="flex items-center gap-3 mt-3">
                                <Icon icon="lucide:badge" className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-default-500">Employee Code</p>
                                    <p className="text-sm font-semibold text-foreground">{offerLetter.empCode}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-4">
                        <div className="flex items-start gap-3">
                            <Icon icon="lucide:info" className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-foreground">Important Instructions</h3>
                                <ul className="text-sm text-default-600 space-y-1 list-disc list-inside">
                                    <li>Download and carefully review your offer letter</li>
                                    <li>Ensure all details are correct before accepting</li>
                                    <li>Once accepted, you'll gain full access to the platform</li>
                                    <li>Contact HR if you have any questions or concerns</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Offer Letter Details */}
                    <Card className="border border-default-200 shadow-sm">
                        <CardBody className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-success/10 p-2.5">
                                        <Icon icon="lucide:file-text" className="h-6 w-6 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {offerLetter?.filename || 'Offer Letter.pdf'}
                                        </p>
                                        <p className="text-xs text-default-500">
                                            Uploaded on {formatDate(offerLetter?.uploadedAt)}
                                        </p>
                                    </div>
                                </div>
                                <Chip color="warning" variant="flat" size="sm">
                                    Pending
                                </Chip>
                            </div>

                            <Button
                                color="primary"
                                variant="flat"
                                size="lg"
                                className="w-full"
                                startContent={<Icon icon="lucide:download" className="h-5 w-5" />}
                                onPress={handleDownload}
                                isLoading={downloading}
                            >
                                {downloading ? 'Downloading...' : 'Download Offer Letter'}
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg border border-danger/20 bg-danger/5 p-4">
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:alert-circle" className="h-5 w-5 text-danger" />
                                <p className="text-sm text-danger">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Accept Button */}
                    <Button
                        color="success"
                        size="lg"
                        className="w-full font-semibold"
                        startContent={<Icon icon="lucide:check-circle" className="h-5 w-5" />}
                        onPress={handleAccept}
                        isDisabled={accepting}
                    >
                        I Accept the Offer Letter
                    </Button>

                    {/* Footer Note */}
                    <p className="text-xs text-center text-default-400">
                        By accepting, you acknowledge that you have read and understood the terms of your employment
                    </p>
                </CardBody>
            </Card>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isDismissable={!accepting}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Icon icon="lucide:check-circle-2" className="h-6 w-6 text-success" />
                            <span>Confirm Acceptance</span>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-default-600">
                            Are you sure you want to accept this offer letter? This action confirms that you have reviewed
                            and agree to the terms of your employment.
                        </p>
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mt-2">
                            <p className="text-sm text-warning-700">
                                <Icon icon="lucide:info" className="inline h-4 w-4 mr-1" />
                                Please ensure you have downloaded and reviewed the offer letter before accepting.
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose} isDisabled={accepting}>
                            Cancel
                        </Button>
                        <Button
                            color="success"
                            onPress={confirmAccept}
                            isLoading={accepting}
                            startContent={!accepting && <Icon icon="lucide:check" className="h-4 w-4" />}
                        >
                            {accepting ? 'Accepting...' : 'Yes, I Accept'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default AcceptOfferLetter;
