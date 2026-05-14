import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Spinner,
    Tabs,
    Tab,
    Input,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { offerLetterService } from '../services';
import companyService from '../services/companyService';
import { format } from 'date-fns';

const OfferLetterManagement = () => {
    const [uploading, setUploading] = useState(false);
    const [offerLetters, setOfferLetters] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchEmployees();
        fetchOfferLetters();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await companyService.getMyCompanyEmployees();
            if (response.data?.success) {
                setEmployees(response.data.data.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            addToast({
                title: 'Error',
                description: 'Failed to fetch employees',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOfferLetters = async () => {
        try {
            setLoading(true);
            const response = await offerLetterService.getAllOfferLetters();
            if (response.data?.success) {
                setOfferLetters(response.data.data || []);
            }
            else {
                addToast({
                    title: 'Error',
                    description: 'Failed to fetch offer letters',
                    color: 'danger'
                });
            }

        } catch (error) {
            console.error('Failed to fetch offer letters:', error);
            addToast({
                title: 'Error',
                description: 'Failed to fetch offer letters',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenUploadModal = (employee) => {
        setSelectedEmployee(employee);
        setSelectedFile(null);
        onOpen();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                addToast({
                    title: 'Invalid File Type',
                    description: 'Only PDF files are allowed',
                    color: 'warning'
                });
                e.target.value = '';
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                addToast({
                    title: 'File Too Large',
                    description: 'File size must be less than 10MB',
                    color: 'warning'
                });
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            addToast({
                title: 'Missing File',
                description: 'Please select a file to upload',
                color: 'warning'
            });
            return;
        }

        try {
            setUploading(true);
            const response = await offerLetterService.uploadOfferLetter(selectedEmployee.id, selectedFile);
            if (response.data.success) {

                const emailSent = response.data?.data?.emailSent;
                const emailError = response.data?.data?.emailError;

                let toastMessage = 'Offer letter uploaded successfully';
                if (emailSent) {
                    toastMessage += '. Email notification sent to employee.';
                } else if (emailError) {
                    toastMessage += '. Email notification failed to send.';
                } else if (!selectedEmployee.email) {
                    toastMessage += '. No email address available for notification.';
                }

                addToast({
                    title: 'Success',
                    description: toastMessage,
                    color: emailSent ? 'success' : 'warning'
                });

                fetchOfferLetters();
                onClose();
            }
            else {
                addToast({
                    title: 'Upload Failed',
                    description: response.data.message,
                    color: 'danger'
                });
            }
        } catch (error) {
            addToast({
                title: 'Upload Failed',
                description: error.response?.data?.message || 'Failed to upload offer letter',
                color: 'danger'
            });
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted':
                return 'success';
            case 'Pending Acceptance':
                return 'warning';
            case 'Not Uploaded':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Offer Letter Management</h1>
                    <p className="text-default-500 mt-2">Upload and manage employee offer letters</p>
                </div>

                <Tabs aria-label="Offer letter management tabs" size="lg" color="primary">
                    {/* Upload Tab */}
                    <Tab
                        key="upload"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:upload" className="w-5 h-5" />
                                <span>Upload Offer Letter</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:users" className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Select Employee</h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Spinner size="lg" />
                                    </div>
                                ) : (
                                    <Table aria-label="Employees table">
                                        <TableHeader>
                                            <TableColumn>EMP CODE</TableColumn>
                                            <TableColumn>EMPLOYEE NAME</TableColumn>
                                            <TableColumn>DESIGNATION</TableColumn>
                                            <TableColumn>EMAIL</TableColumn>
                                            <TableColumn>ACTION</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {employees.map((employee) => (
                                                <TableRow key={employee.id}>
                                                    <TableCell>{employee.empCode}</TableCell>
                                                    <TableCell>{employee.name || `${employee.firstName} ${employee.lastName}`}</TableCell>
                                                    <TableCell>{employee.designation || 'N/A'}</TableCell>
                                                    <TableCell>{employee.email}</TableCell>
                                                    <TableCell>
                                                        {employee.offerLetterPath ? (
                                                            // Show offerLetterAccepted or not. If accepted when did they accept
                                                            employee.offerLetterAccepted ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Icon icon="lucide:check" className="w-5 h-5 text-success" />
                                                                    <span className="text-success">Accepted on {format(employee.offerLetterAcceptedAt, 'dd LLL yyyy')}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <Icon icon="lucide:x" className="w-5 h-5 text-danger" />
                                                                    <span className="text-danger">Not Accepted</span>
                                                                </div>
                                                            )

                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="flat"
                                                                onPress={() => handleOpenUploadModal(employee)}
                                                                startContent={<Icon icon="lucide:upload" className="w-4 h-4" />}
                                                            >
                                                                Upload
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Status Tab */}
                    <Tab
                        key="status"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:list-checks" className="w-5 h-5" />
                                <span>View Status</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:file-signature" className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">All Offer Letters ({offerLetters.length})</h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Spinner size="lg" />
                                    </div>
                                ) : offerLetters.length === 0 ? (
                                    <p className="text-center py-8 text-default-500">No offer letters found</p>
                                ) : (
                                    <Table aria-label="Offer letters table">
                                        <TableHeader>
                                            <TableColumn>EMP CODE</TableColumn>
                                            <TableColumn>EMPLOYEE NAME</TableColumn>
                                            <TableColumn>DESIGNATION</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                            <TableColumn>UPLOADED</TableColumn>
                                            <TableColumn>ACCEPTED</TableColumn>
                                            <TableColumn>ACTIONS</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {offerLetters.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.empCode || 'N/A'}</TableCell>
                                                    <TableCell>{item.name || 'N/A'}</TableCell>
                                                    <TableCell>{item.designation || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            color={getStatusColor(item.status)}
                                                            variant="flat"
                                                            size="sm"
                                                        >
                                                            {item.status}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell>{format(item.uploadedAt, 'dd LLL yyyy')}</TableCell>
                                                    <TableCell>{item.acceptedAt ? format(item.acceptedAt, 'dd LLL yyyy') : 'Not Accepted'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {item.hasOfferLetter && (
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    onPress={() => {
                                                                        const employee = employees.find(e => e.id === item.id);
                                                                        if (employee) handleOpenUploadModal(employee);
                                                                    }}
                                                                    startContent={<Icon icon="lucide:refresh-cw" className="w-4 h-4" />}
                                                                >
                                                                    Re-upload
                                                                </Button>
                                                            )}
                                                            {!item.hasOfferLetter && (
                                                                <Button
                                                                    size="sm"
                                                                    color="warning"
                                                                    variant="flat"
                                                                    onPress={() => {
                                                                        const employee = employees.find(e => e.id === item.id);
                                                                        if (employee) handleOpenUploadModal(employee);
                                                                    }}
                                                                    startContent={<Icon icon="lucide:upload" className="w-4 h-4" />}
                                                                >
                                                                    Upload
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>

                {/* Upload Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalContent>
                        <ModalHeader>
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:file-signature" className="h-5 w-5 text-primary" />
                                <span>
                                    Upload Offer Letter for {selectedEmployee?.name || selectedEmployee?.firstName} ({selectedEmployee?.empCode})
                                </span>
                            </div>
                        </ModalHeader>
                        <form onSubmit={handleUploadSubmit}>
                            <ModalBody>
                                <div className="space-y-4">
                                    {/* Instructions */}
                                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Icon icon="lucide:info" className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">Important</p>
                                                <ul className="text-xs text-default-600 space-y-1 list-disc list-inside">
                                                    <li>Only PDF files are accepted</li>
                                                    <li>Maximum file size: 10MB</li>
                                                    <li>Employee will be required to accept before accessing the platform</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Input */}
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        label="Offer Letter (PDF)"
                                        placeholder="Choose PDF file"
                                        onChange={handleFileChange}
                                        isRequired
                                        description={selectedFile ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)` : 'Select a PDF file'}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose} isDisabled={uploading}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={uploading}
                                    isDisabled={uploading || !selectedFile}
                                    startContent={!uploading && <Icon icon="lucide:upload" className="h-4 w-4" />}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Offer Letter'}
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
            </motion.div>
        </div>
    );
};

export default OfferLetterManagement;
