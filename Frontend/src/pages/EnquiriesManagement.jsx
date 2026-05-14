import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Chip,
    useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import authService from '../services/authService';
import companyService from '../services/companyService';

const EnquiriesManagement = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [creatingCompany, setCreatingCompany] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [username, setUsername] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const response = await authService.getEnquiries();
            if (response?.data?.success) {
                setEnquiries(response.data.enquiries || []);
            }
        } catch (err) {
            console.error('Error fetching enquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setCompanyName(enquiry.companyName || '');
        setError('');
        onOpen();
    };

    const submitCreateCompany = async () => {
        if (!companyName.trim()) {
            setError('Company name is required');
            return;
        }

        setCreatingCompany(true);
        setError('');

        try {
            const response = await companyService.createCompany({
                companyName: companyName.trim(),
                name: selectedEnquiry.name,
                email: selectedEnquiry.mailId,
                phoneNumber: selectedEnquiry.phoneNumber,

            });

            if (response?.data?.success) {
                // Refresh enquiries list
                await fetchEnquiries();
                onClose();
                setSelectedEnquiry(null);
                setCompanyName('');
                setUsername(response.data.user.empCode);
                setSuccess('Company created successfully');
                setError(null);
            } else {
                setError(response?.data?.message || 'Failed to create company');
            }
        } catch (err) {
            setError('An error occurred while creating the company');
            console.error(err);
        } finally {
            setCreatingCompany(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="shadow-lg">
                <CardHeader className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon icon="lucide:inbox" width="24" height="24" className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Enquiries Management</h1>
                            <p className="text-sm text-default-500">
                                Manage and convert enquiries to companies
                            </p>
                        </div>
                    </div>
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="lucide:refresh-cw" />}
                        onPress={fetchEnquiries}
                        isLoading={loading}
                    >
                        Refresh
                    </Button>
                </CardHeader>

                <CardBody className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Icon icon="lucide:loader-2" width="32" height="32" className="animate-spin text-primary" />
                        </div>
                    ) : enquiries.length === 0 ? (
                        <div className="text-center py-12">
                            <Icon icon="lucide:inbox" width="48" height="48" className="mx-auto text-default-300 mb-4" />
                            <p className="text-default-500">No enquiries found</p>
                        </div>
                    ) : (
                        <Table aria-label="Enquiries table">
                            <TableHeader>
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>EMAIL</TableColumn>
                                <TableColumn>PHONE</TableColumn>
                                <TableColumn>COMPANY</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>SUBMITTED</TableColumn>
                                <TableColumn>EMP CODE</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {enquiries.map((enquiry) => (
                                    <TableRow key={enquiry.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="lucide:user" className="text-default-400" />
                                                <span className="font-medium">{enquiry.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="lucide:mail" className="text-default-400" />
                                                <span className="text-sm">{enquiry.mailId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="lucide:phone" className="text-default-400" />
                                                <span className="text-sm">{enquiry.phoneNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="lucide:building-2" className="text-default-400" />
                                                <span className="font-medium">{enquiry.companyName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={enquiry.status === 'pending' ? 'warning' : 'success'}
                                                variant="flat"
                                                size="sm"
                                            >
                                                {enquiry.status}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-default-500">
                                                {formatDate(enquiry.createdAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-default-500">
                                                {enquiry.empCode ? enquiry.empCode : "N/A"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                enquiry.empCode ? "Company already exists" :

                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="flat"
                                                        startContent={<Icon icon="lucide:building-2" />}
                                                        onPress={() => handleCreateCompany(enquiry)}
                                                        isDisabled={enquiry.status === 'processed'}
                                                    >
                                                        Create Company
                                                    </Button>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Create Company Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold">Create Company</h2>
                        <p className="text-sm text-default-500 font-normal">
                            Create a new company from enquiry
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        {selectedEnquiry && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-default-100">
                                    <h3 className="font-semibold mb-2">Enquiry Details</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-default-500">Contact:</span> {selectedEnquiry.name}</p>
                                        <p><span className="text-default-500">Email:</span> {selectedEnquiry.mailId}</p>
                                        <p><span className="text-default-500">Phone:</span> {selectedEnquiry.phoneNumber}</p>
                                    </div>
                                </div>

                                <Input
                                    label="Company Name"
                                    placeholder="Enter company name"
                                    variant="bordered"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    startContent={<Icon icon="lucide:building-2" className="text-default-400" />}
                                />

                                {error && (
                                    <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm flex items-center gap-2">
                                        <Icon icon="lucide:alert-circle" width="16" height="16" />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-3 rounded-lg bg-success/10 text-success text-sm flex items-center gap-2">
                                        <Icon icon="lucide:check-circle" width="16" height="16" />
                                        {success}
                                        <p>User created with username: {username}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={submitCreateCompany}
                            isLoading={creatingCompany}
                            startContent={!creatingCompany && <Icon icon="lucide:check" />}
                        >
                            Create Company
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default EnquiriesManagement;
