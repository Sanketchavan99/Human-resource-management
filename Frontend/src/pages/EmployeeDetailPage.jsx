import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Button, Spinner, Chip, Divider, addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { userService } from '../services';
import { format } from 'date-fns';

const EmployeeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployeeDetails();
    }, [id]);

    const fetchEmployeeDetails = async () => {
        try {
            const response = await userService.getEmployeeDetails(id);
            if (response?.data?.success) {
                setEmployee(response.data.data.user);
                setDocuments(response.data.data.documents || []);
            } else {
                addToast({
                    title: 'Error',
                    description: 'Failed to fetch employee details',
                    color: 'danger',
                });
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            addToast({
                title: 'Error',
                description: 'Error loading employee details',
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await userService.downloadDocument(filename);
            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                addToast({
                    title: 'Error',
                    description: 'Failed to download document',
                    color: 'danger',
                });
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            addToast({
                title: 'Error',
                description: 'Error downloading document',
                color: 'danger',
            });
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

    const DocItem = ({ doc }) => (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon icon="lucide:file-text" width={24} />
                </div>
                <div>
                    <p className="font-medium capitalize">{doc.name}</p>
                    {doc.uploadedAt && (
                        <p className="text-tiny text-default-400">
                            {format(doc.uploadedAt, 'dd LLL yyyy, h:mm a')}
                        </p>
                    )}
                </div>
            </div>
            <Button
                size="sm"
                variant="flat"
                color="primary"
                isIconOnly
                onClick={() => handleDownload(doc.filename)}
            >
                <Icon icon="lucide:download" />
            </Button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading employee details..." />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-xl text-default-500">Employee not found</p>
                <Button color="primary" onClick={() => navigate('/admin')}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="light"
                    startContent={<Icon icon="lucide:arrow-left" />}
                    onClick={() => navigate('/admin')}
                    className="mb-4"
                >
                    Back to Dashboard
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {employee.name}
                            <Chip size="sm" color="primary" variant="flat">{employee.role}</Chip>
                        </h1>
                        <p className="text-default-500">{employee.empCode} • {employee.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Chip
                            color={employee.lastWorkingDate ? "danger" : "success"}
                            variant="flat"
                        >
                            {employee.lastWorkingDate ? "Inactive" : "Active"}
                        </Chip>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal & Contact Info */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Personal Information */}
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:user" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <InfoItem label="Full Name" value={`${employee.firstName || ''} ${employee.lastName || ''}`} />
                                <InfoItem label="Father's Name" value={employee.fatherName} />
                                <InfoItem label="Date of Birth" value={formatDate(employee.dob)} />
                                <InfoItem label="Gender" value={employee.gender} />
                                <InfoItem label="Marital Status" value={employee.maritalStatus} />
                                <InfoItem label="Education" value={employee.education} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Employment Details */}
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:briefcase" />
                                Employment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <InfoItem label="Designation" value={employee.designation} />
                                <InfoItem label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
                                <InfoItem label="Salary" value={employee.salary ? `₹${Number(employee.salary).toLocaleString('en-IN')}` : 'N/A'} />
                                <InfoItem label="Company" value={employee.company?.name || 'N/A'} />
                                {employee.lastWorkingDate && (
                                    <InfoItem label="Last Working Date" value={formatDate(employee.lastWorkingDate)} />
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Contact & IDs */}
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:phone" />
                                Contact & Identification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <InfoItem label="Email" value={employee.email} />
                                <InfoItem label="Phone Number" value={employee.phoneNumber} />
                                <InfoItem label="Alternate Phone" value={employee.altPhoneNumber} />
                                <InfoItem label="PAN Number" value={employee.panCardNumber} />
                                <InfoItem label="Aadhar Number" value={employee.aadharNumber} />
                                <InfoItem label="UAN Number" value={employee.uanNumber} />
                                <InfoItem label="ESIC Number" value={employee.esicNumber} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Bank Details */}
                    {employee.bankDetail && (
                        <Card>
                            <CardBody>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Icon icon="lucide:credit-card" />
                                    Bank Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                    <InfoItem label="Bank Name" value={employee.bankDetail.bankName} />
                                    <InfoItem label="Account Number" value={employee.bankDetail.accountNumber} />
                                    <InfoItem label="IFSC Code" value={employee.bankDetail.ifscCode} />
                                    <InfoItem label="Branch Name" value={employee.bankDetail.branchName} />
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Right Column: Documents & Related */}
                <div className="space-y-6">
                    {/* Documents */}
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:file-stack" />
                                Documents
                            </h3>
                            {documents.length > 0 ? (
                                <div className="space-y-3">
                                    {documents.map((doc, index) => (
                                        <DocItem key={index} doc={doc} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-default-500 italic">No documents uploaded.</p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Address */}
                    {employee.addresses && employee.addresses.length > 0 && (
                        <Card>
                            <CardBody>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Icon icon="lucide:map-pin" />
                                    Addresses
                                </h3>
                                <div className="space-y-4">
                                    {employee.addresses.map((addr, index) => (
                                        <div key={index}>
                                            <p className="font-medium text-sm text-primary mb-1 capitalize">{addr.type} Address</p>
                                            <p className="text-sm text-default-600">{addr.addressLine}</p>
                                            <p className="text-sm text-default-600">
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </p>
                                            {index < employee.addresses.length - 1 && <Divider className="my-3" />}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-default-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
    </div>
);

export default EmployeeDetailPage;
