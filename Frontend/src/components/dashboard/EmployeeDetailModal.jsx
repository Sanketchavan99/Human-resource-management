import React, { useState, useEffect } from 'react';
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Card, CardBody, Chip, Spinner, Divider, addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import companyService from '../../services/companyService';

const EmployeeDetailModal = ({
    isOpen,
    onClose,
    employee: initialEmployee
}) => {
    const [employee, setEmployee] = useState(initialEmployee);
    const [loading, setLoading] = useState(false);
    const [generatingIdCard, setGeneratingIdCard] = useState(false);
    const [uploadingEsic, setUploadingEsic] = useState(false);

    // Fetch complete employee profile when modal opens
    useEffect(() => {
        if (isOpen && initialEmployee?.id) {
            fetchEmployeeProfile(initialEmployee.id);
        }
    }, [isOpen, initialEmployee]);

    const fetchEmployeeProfile = async (employeeId) => {
        setLoading(true);
        try {
            const response = await companyService.getEmployeeCompleteProfile(employeeId);
            if (response?.data?.success) {
                setEmployee(response.data.data.user);
            }
        } catch (error) {
            console.error('Error fetching employee profile:', error);
            addToast({
                title: 'Error',
                description: 'Error loading employee details',
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateIdCard = async (employeeId) => {
        setGeneratingIdCard(true);
        try {
            const response = await companyService.generateEmployeeIdCard(employeeId);
            if (response?.data?.success) {
                addToast({
                    title: 'Success',
                    description: 'ID card generated successfully',
                    color: 'success',
                });
                // Refresh employee data
                fetchEmployeeProfile(employeeId);
            } else {
                addToast({
                    title: 'Error',
                    description: 'Error generating ID card',
                    color: 'danger',
                });
            }
        } catch (error) {
            console.error('Error generating ID card:', error);
            addToast({
                title: 'Error',
                description: 'Error generating ID card',
                color: 'danger',
            });
        } finally {
            setGeneratingIdCard(false);
        }
    };

    const handleUploadEsic = async (employeeId, file) => {
        setUploadingEsic(true);
        try {
            const formData = new FormData();
            formData.append('esicCard', file);

            const response = await companyService.uploadEmployeeEsicCard(employeeId, formData);
            if (response?.data?.success) {
                addToast({
                    title: 'Success',
                    description: 'ESIC card uploaded successfully',
                    color: 'success',
                });
                // Refresh employee data
                fetchEmployeeProfile(employeeId);
            } else {
                addToast({
                    title: 'Error',
                    description: 'Error uploading ESIC card',
                    color: 'danger',
                });
            }
        } catch (error) {
            console.error('Error uploading ESIC card:', error);
            addToast({
                title: 'Error',
                description: 'Error uploading ESIC card',
                color: 'danger',
            });
        } finally {
            setUploadingEsic(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">Employee Details</h2>
                            <p className="text-sm text-default-500 font-normal">
                                {employee.empCode} • {employee.email}
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Spinner size="lg" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* ID Card & ESIC Card Actions */}
                                    <Card className="bg-primary/5">
                                        <CardBody>
                                            <h3 className="font-semibold mb-4">Document Management</h3>
                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    color={employee.idCardPath ? "success" : "primary"}
                                                    variant="flat"
                                                    startContent={generatingIdCard ? <Spinner size="sm" /> : <Icon icon={employee.idCardPath ? "lucide:check-circle" : "lucide:id-card"} />}
                                                    onClick={() => handleGenerateIdCard(employee.id)}
                                                    isDisabled={generatingIdCard}
                                                >
                                                    {generatingIdCard ? 'Generating...' : employee.idCardPath ? 'Regenerate ID Card' : 'Generate ID Card'}
                                                </Button>

                                                <div>
                                                    <input
                                                        type="file"
                                                        id={`esic-upload-${employee.id}`}
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) handleUploadEsic(employee.id, file);
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        color={employee.esicCardPath ? "success" : "secondary"}
                                                        variant="flat"
                                                        startContent={uploadingEsic ? <Spinner size="sm" /> : <Icon icon={employee.esicCardPath ? "lucide:check-circle" : "lucide:upload"} />}
                                                        onClick={() => document.getElementById(`esic-upload-${employee.id}`).click()}
                                                        isDisabled={uploadingEsic}
                                                    >
                                                        {uploadingEsic ? 'Uploading...' : employee.esicCardPath ? 'Update ESIC Card' : 'Upload ESIC Card'}
                                                    </Button>
                                                </div>

                                                {employee.idCardPath && (
                                                    <Chip color="success" variant="flat" size="sm">
                                                        ID Card: {formatDate(employee.idCardGeneratedAt)}
                                                    </Chip>
                                                )}
                                                {employee.esicCardPath && (
                                                    <Chip color="success" variant="flat" size="sm">
                                                        ESIC: {formatDate(employee.esicUploadedAt)}
                                                    </Chip>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Personal Details */}
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Icon icon="lucide:user" />
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <InfoItem label="Full Name" value={`${employee.firstName || ''} ${employee.lastName || ''}`} />
                                            <InfoItem label="Father's Name" value={employee.fatherName} />
                                            <InfoItem label="Date of Birth" value={formatDate(employee.dob)} />
                                            <InfoItem label="Gender" value={employee.gender} />
                                            <InfoItem label="Marital Status" value={employee.maritalStatus} />
                                            <InfoItem label="Education" value={employee.education} />
                                            <InfoItem label="Designation" value={employee.designation} />
                                            <InfoItem label="Salary" value={employee.salary ? `₹${Number(employee.salary).toLocaleString('en-IN')}` : 'N/A'} />
                                            <InfoItem label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
                                        </div>
                                    </div>

                                    <Divider />

                                    {/* Contact & IDs */}
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Icon icon="lucide:phone" />
                                            Contact & Identification
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <InfoItem label="Email" value={employee.email} />
                                            <InfoItem label="Phone" value={employee.phoneNumber} />
                                            <InfoItem label="PAN Number" value={employee.panCardNumber} />
                                            <InfoItem label="Aadhar Number" value={employee.aadharNumber} />
                                            <InfoItem label="UAN Number" value={employee.uanNumber} />
                                            <InfoItem label="ESIC Number" value={employee.esicNumber} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

// Helper component for displaying info items
const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-default-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
    </div>
);

export default EmployeeDetailModal;
