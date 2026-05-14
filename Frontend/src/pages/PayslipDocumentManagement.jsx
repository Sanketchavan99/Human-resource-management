import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, Tabs, Tab, Divider, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import payslipDocumentService from '@/services/payslipDocumentService';
import companyService from '@/services/companyService';
import ConfirmModal from '@/components/ui/ConfirmModal';

const PayslipDocumentManagement = () => {
    const [uploading, setUploading] = useState(false);
    const [payslipDocuments, setPayslipDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [uploadResults, setUploadResults] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [uploadMonth, setUploadMonth] = useState('');
    const [uploadYear, setUploadYear] = useState('');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isLoading: false
    });

    const months = [
        { label: 'January', value: 1 },
        { label: 'February', value: 2 },
        { label: 'March', value: 3 },
        { label: 'April', value: 4 },
        { label: 'May', value: 5 },
        { label: 'June', value: 6 },
        { label: 'July', value: 7 },
        { label: 'August', value: 8 },
        { label: 'September', value: 9 },
        { label: 'October', value: 10 },
        { label: 'November', value: 11 },
        { label: 'December', value: 12 },
    ];

    const years = Array.from({ length: 10 }, (_, i) => ({
        label: Number(new Date().getFullYear() - i).toString(),
        value: Number(new Date().getFullYear() - i),
    }));

    useEffect(() => {
        fetchEmployees();
        fetchPayslipDocuments();
    }, [filterMonth, filterYear]);

    const fetchEmployees = async () => {
        try {
            const response = await companyService.getMyCompanyEmployees();
            if (response.data?.success) {
                setEmployees(response.data.data.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayslipDocuments = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterMonth) filters.month = filterMonth;
            if (filterYear) filters.year = filterYear;

            const response = await payslipDocumentService.getAllPayslipDocuments(filters);
            setPayslipDocuments(response.payslipDocuments || []);
        } catch (error) {
            console.error('Failed to fetch payslip documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenUploadModal = (employee) => {
        setSelectedEmployee(employee);
        setUploadMonth('');
        setUploadYear('');
        onOpen();
    };

    const handleSingleUploadSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const file = formData.get('file');

        if (!file || !uploadMonth || !uploadYear) {
            addToast({
                title: 'Missing Information',
                description: 'Please select month, year, and file',
                color: 'warning'
            });
            return;
        }

        try {
            setUploading(true);
            await payslipDocumentService.uploadSinglePayslip(
                selectedEmployee.id,
                uploadMonth,
                uploadYear,
                file
            );
            addToast({
                title: 'Success',
                description: 'Payslip uploaded successfully',
                color: 'success'
            });
            fetchPayslipDocuments();
            onClose();
        } catch (error) {
            addToast({
                title: 'Upload Failed',
                description: error.message || 'Failed to upload payslip',
                color: 'danger'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const month = formData.get('bulkMonth');
        const year = formData.get('bulkYear');
        const files = e.target.elements.bulkFiles.files;

        if (!month || !year || files.length === 0) {
            addToast({
                title: 'Missing Information',
                description: 'Month, year, and at least one file are required',
                color: 'warning'
            });
            return;
        }

        try {
            setUploading(true);
            const response = await payslipDocumentService.uploadBulkPayslips(month, year, files);
            setUploadResults(response.results);

            // Show success toast
            addToast({
                title: 'Bulk Upload Completed',
                description: `Processed ${response.results.total} files: ${response.results.created} created, ${response.results.updated} updated`,
                color: 'success'
            });

            fetchPayslipDocuments();
            e.target.reset();
            onOpen(); // Open modal to show detailed results
        } catch (error) {
            addToast({
                title: 'Upload Failed',
                description: error.message || 'Failed to upload payslips',
                color: 'danger'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Document',
            message: 'Are you sure you want to delete this payslip document? This action cannot be undone.',
            confirmText: 'Delete',
            confirmColor: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await payslipDocumentService.deletePayslipDocument(id);
                    addToast({
                        title: 'Deleted',
                        description: 'Payslip document deleted successfully',
                        color: 'success'
                    });
                    fetchPayslipDocuments();
                } catch (error) {
                    addToast({
                        title: 'Delete Failed',
                        description: error.message || 'Failed to delete payslip document',
                        color: 'danger'
                    });
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
                }
            }
        });
    };

    const handleDownload = async (id) => {
        try {
            await payslipDocumentService.downloadPayslipDocument(id);
            addToast({
                title: 'Download Started',
                description: 'Your payslip document is downloading',
                color: 'success'
            });
        } catch (error) {
            addToast({
                title: 'Download Failed',
                description: error.message || 'Failed to download payslip document',
                color: 'danger'
            });
        }
    };

    const getMonthName = (monthNum) => {
        return months.find(m => m.value === monthNum)?.label || monthNum;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-6">Payslip Document Management</h1>

                <Tabs aria-label="Payslip management tabs" size="lg" color="primary">
                    {/* Single Upload Tab */}
                    <Tab
                        key="single"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:account-upload" className="w-5 h-5" />
                                <span>Single Upload</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:account-multiple" className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Upload Payslip for Individual Employee</h2>
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
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={() => handleOpenUploadModal(employee)}
                                                            startContent={<Icon icon="mdi:upload" className="w-4 h-4" />}
                                                        >
                                                            Upload
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Bulk Upload Tab */}
                    <Tab
                        key="bulk"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:file-upload-outline" className="w-5 h-5" />
                                <span>Bulk Upload</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:file-upload-outline" className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Bulk Upload Payslips</h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {/* Instructions */}
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Icon icon="mdi:information" className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-blue-900 mb-2">How to Proceed with Bulk Upload</h3>
                                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                                <li>Select the month and year for which these payslips belong</li>
                                                <li><strong>Important:</strong> All files must be named exactly as the employee code (empCode)</li>
                                                <li>Example: If employee code is <code className="bg-blue-100 px-1 py-0.5 rounded">EMP001</code>, the file should be named <code className="bg-blue-100 px-1 py-0.5 rounded">EMP001.pdf</code></li>
                                                <li>Supported formats: PDF, JPG, JPEG, PNG</li>
                                                <li>Files that don't match any employee code will be reported as errors</li>
                                                <li>You can upload multiple files at once</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <Divider className="my-4" />

                                <form onSubmit={handleBulkUpload}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Select
                                            label="Month"
                                            placeholder="Select month"
                                            name="bulkMonth"
                                            isRequired
                                        >
                                            {months.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Select
                                            label="Year"
                                            name="bulkYear"
                                            placeholder="Select year"
                                            isRequired
                                        >
                                            {years.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            label="Payslip Files"
                                            placeholder="Choose files"
                                            name="bulkFiles"
                                            multiple
                                            isRequired
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            type="submit"
                                            color="secondary"
                                            isLoading={uploading}
                                            isDisabled={uploading}
                                            startContent={<Icon icon="mdi:file-upload-outline" className="w-4 h-4" />}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Bulk Payslips'}
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* View Documents Tab */}
                    <Tab
                        key="view"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:file-document" className="w-5 h-5" />
                                <span>View Documents</span>
                            </div>
                        }
                    >
                        <div className="mt-4 space-y-4">
                            {/* Filter Section */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:filter" className="w-5 h-5" />
                                        <h2 className="text-xl font-semibold">Filter Payslip Documents</h2>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex gap-4 items-end">
                                        <Select
                                            label="Month"
                                            placeholder="All Months"
                                            className="max-w-xs"
                                            selectedKeys={filterMonth ? [filterMonth] : []}
                                            onSelectionChange={(keys) => setFilterMonth(Array.from(keys)[0] || '')}
                                        >
                                            <SelectItem key="" value="">All Months</SelectItem>
                                            {months.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Select
                                            label="Year"
                                            placeholder="All Years"
                                            className="max-w-xs"
                                            selectedKeys={filterYear ? [filterYear] : []}
                                            onSelectionChange={(keys) => setFilterYear(Array.from(keys)[0] || '')}
                                        >
                                            <SelectItem key="" value="">All Years</SelectItem>
                                            {years.map((y) => (
                                                <SelectItem key={y.value} value={y.value}>
                                                    {y.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Button
                                            color="danger"
                                            onPress={() => {
                                                setFilterMonth('');
                                                setFilterYear('');
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Payslip Documents Table */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:file-document" className="w-5 h-5" />
                                        <h2 className="text-xl font-semibold">All Payslip Documents ({payslipDocuments.length})</h2>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner size="lg" />
                                        </div>
                                    ) : payslipDocuments.length === 0 ? (
                                        <p className="text-center py-8 text-gray-500">No payslip documents found</p>
                                    ) : (
                                        <Table aria-label="Payslip documents table">
                                            <TableHeader>
                                                <TableColumn>EMP CODE</TableColumn>
                                                <TableColumn>EMPLOYEE NAME</TableColumn>
                                                <TableColumn>COMPANY</TableColumn>
                                                <TableColumn>MONTH</TableColumn>
                                                <TableColumn>YEAR</TableColumn>
                                                <TableColumn>UPLOADED</TableColumn>
                                                <TableColumn>ACTIONS</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {payslipDocuments.map((doc) => (
                                                    <TableRow key={doc.id}>
                                                        <TableCell>{doc.user?.empCode || 'N/A'}</TableCell>
                                                        <TableCell>{doc.user?.name || 'N/A'}</TableCell>
                                                        <TableCell>{doc.company?.name || 'N/A'}</TableCell>
                                                        <TableCell>{getMonthName(doc.month)}</TableCell>
                                                        <TableCell>{doc.year}</TableCell>
                                                        <TableCell>
                                                            <Chip color="success" size="sm">
                                                                {new Date(doc.createdAt).toLocaleDateString()}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    onPress={() => handleDownload(doc.id)}
                                                                    startContent={<Icon icon="mdi:download" className="w-4 h-4" />}
                                                                >
                                                                    Download
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    color="danger"
                                                                    variant="flat"
                                                                    onPress={() => handleDelete(doc.id)}
                                                                    startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>
                </Tabs>

                {/* Upload Modal for Single Upload */}
                <Modal isOpen={isOpen && !uploadResults} onClose={onClose} size="md">
                    <ModalContent>
                        <ModalHeader>
                            Upload Payslip for {selectedEmployee?.name || selectedEmployee?.firstName} ({selectedEmployee?.empCode})
                        </ModalHeader>
                        <form onSubmit={handleSingleUploadSubmit}>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Select
                                        label="Month"
                                        placeholder="Select month"
                                        selectedKeys={uploadMonth ? [uploadMonth] : []}
                                        onSelectionChange={(keys) => setUploadMonth(Array.from(keys)[0])}
                                        isRequired
                                    >
                                        {months.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Year"
                                        placeholder="Select year"
                                        selectedKeys={uploadYear ? [uploadYear] : []}
                                        onSelectionChange={(keys) => setUploadYear(Array.from(keys)[0])}
                                        isRequired
                                    >
                                        {years.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        label="Payslip File"
                                        placeholder="Choose file"
                                        name="file"
                                        isRequired
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={uploading}
                                    isDisabled={uploading}
                                >
                                    Upload
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                {/* Bulk Upload Results Modal */}
                <Modal isOpen={isOpen && uploadResults !== null} onClose={() => { setUploadResults(null); onClose(); }} size="2xl">
                    <ModalContent>
                        <ModalHeader>Bulk Upload Results</ModalHeader>
                        <ModalBody>
                            {uploadResults && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card>
                                            <CardBody className="text-center p-4">
                                                <p className="text-sm text-default-500 font-medium">Total Files</p>
                                                <p className="text-2xl font-bold">{uploadResults.total}</p>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-success/10 border border-success/20">
                                            <CardBody className="text-center p-4">
                                                <p className="text-sm text-success-600 font-medium">Created</p>
                                                <p className="text-2xl font-bold text-success">{uploadResults.created}</p>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-primary/10 border border-primary/20">
                                            <CardBody className="text-center p-4">
                                                <p className="text-sm text-primary-600 font-medium">Updated</p>
                                                <p className="text-2xl font-bold text-primary">{uploadResults.updated}</p>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    {uploadResults.errors && uploadResults.errors.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-danger" />
                                                <h3 className="font-semibold text-danger">Errors ({uploadResults.errors.length})</h3>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto p-4 rounded-lg bg-danger/10 border border-danger/20">
                                                <div className="space-y-2">
                                                    {uploadResults.errors.map((error, index) => (
                                                        <div key={index} className="text-sm text-danger-700">
                                                            <strong>{error.fileName || error.empCode}:</strong> {error.error}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {uploadResults.errors && uploadResults.errors.length === 0 && (
                                        <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
                                            <Icon icon="mdi:check-circle" className="w-5 h-5" />
                                            <span className="font-medium">All files uploaded successfully!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={() => { setUploadResults(null); onClose(); }}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    isLoading={confirmModal.isLoading}
                    confirmText={confirmModal.confirmText}
                    confirmColor={confirmModal.confirmColor}
                />
            </motion.div>
        </div >
    );
};

export default PayslipDocumentManagement;
