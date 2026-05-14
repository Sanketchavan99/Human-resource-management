import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, addToast } from '@heroui/react';
import { Upload, Download, Trash2, FileText, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import payslipService from '@/services/payslipService';
import ConfirmModal from '@/components/ui/ConfirmModal';

const PayslipManagement = () => {
    const [uploading, setUploading] = useState(false);
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [uploadResults, setUploadResults] = useState(null);
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
        fetchPayslips();
    }, [filterMonth, filterYear]);

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterMonth) filters.month = filterMonth;
            if (filterYear) filters.year = filterYear;

            const response = await payslipService.getAllPayslips(filters);
            setPayslips(response.payslips || []);
        } catch (error) {
            console.error('Failed to fetch payslips:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const excelFile = formData.get('excelFile');
        const month = formData.get('month');
        const year = formData.get('year');


        console.log(excelFile, month, year);
        try {
            setUploading(true);
            const response = await payslipService.uploadPayslipExcel(excelFile, month, year);
            setUploadResults(response.results);
            onOpen();
            fetchPayslips();
        } catch (error) {
            alert(error.message || 'Failed to upload payslips');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Payslip',
            message: 'Are you sure you want to delete this payslip? This action cannot be undone.',
            confirmText: 'Delete',
            confirmColor: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await payslipService.deletePayslip(id);
                    fetchPayslips();
                    addToast({
                        title: 'Deleted',
                        description: 'Payslip deleted successfully',
                        color: 'success'
                    });
                } catch (error) {
                    addToast({
                        title: 'Error',
                        description: error.message || 'Failed to delete payslip',
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
            await payslipService.downloadPayslip(id);
        } catch (error) {
            alert(error.message || 'Failed to download payslip');
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
                <h1 className="text-3xl font-bold mb-6">Payslip Management</h1>

                {/* Upload Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">Upload Payslips</h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleUpload}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        label="Select Excel File"
                                        placeholder="Choose payslip Excel file"
                                        name="excelFile"
                                    />
                                </div>
                                <Select
                                    label="Month"
                                    placeholder="Select month"
                                    name='month'
                                    items={months}

                                >
                                    {(item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    )}
                                </Select>
                                <Select
                                    label="Year"
                                    name='year'
                                    placeholder="Select year"
                                    items={years}
                                >
                                    {(item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    )}
                                </Select>
                            </div>
                            <div className="mt-4">
                                <Button
                                    type='submit'
                                    color="primary"
                                    isLoading={uploading}
                                    isDisabled={uploading}
                                    startContent={<Upload className="w-4 h-4" />}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Payslips'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Filter Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">Filter Payslips</h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="flex gap-4 items-end">
                            <Select
                                label="Month"
                                placeholder="All Months"
                                className="max-w-xs"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
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
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}

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

                {/* Payslips Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">All Payslips ({payslips.length})</h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="lg" />
                            </div>
                        ) : payslips.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No payslips found</p>
                        ) : (
                            <Table aria-label="Payslips table">
                                <TableHeader>
                                    <TableColumn>EMP CODE</TableColumn>
                                    <TableColumn>EMPLOYEE NAME</TableColumn>
                                    <TableColumn>MONTH</TableColumn>
                                    <TableColumn>YEAR</TableColumn>
                                    <TableColumn>NET AMOUNT</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {payslips.map((payslip) => (
                                        <TableRow key={payslip.id}>
                                            <TableCell>{payslip.empCode}</TableCell>
                                            <TableCell>{payslip.empName}</TableCell>
                                            <TableCell>{getMonthName(payslip.month)}</TableCell>
                                            <TableCell>{payslip.year}</TableCell>
                                            <TableCell>₹{parseFloat(payslip.netAmount || 0).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip color={payslip.pdfFilePath ? 'success' : 'warning'} size="sm">
                                                    {payslip.pdfFilePath ? 'PDF Ready' : 'Processing'}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="flat"
                                                        onPress={() => handleDownload(payslip.id)}
                                                        startContent={<Download className="w-4 h-4" />}
                                                    >
                                                        Download
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        onPress={() => handleDelete(payslip.id)}
                                                        startContent={<Trash2 className="w-4 h-4" />}
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

                {/* Upload Results Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                    <ModalContent>
                        <ModalHeader>Upload Results</ModalHeader>
                        <ModalBody>
                            {uploadResults && (
                                <div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <Card>
                                            <CardBody className="text-center">
                                                <p className="text-2xl font-bold">{uploadResults.total}</p>
                                                <p className="text-sm text-gray-600">Total</p>
                                            </CardBody>
                                        </Card>
                                        <Card>
                                            <CardBody className="text-center">
                                                <p className="text-2xl font-bold text-green-600">{uploadResults.created}</p>
                                                <p className="text-sm text-gray-600">Created</p>
                                            </CardBody>
                                        </Card>
                                        <Card>
                                            <CardBody className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">{uploadResults.updated}</p>
                                                <p className="text-sm text-gray-600">Updated</p>
                                            </CardBody>
                                        </Card>
                                    </div>
                                    {uploadResults.errors && uploadResults.errors.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-red-600">Errors ({uploadResults.errors.length})</h3>
                                            <div className="max-h-60 overflow-y-auto">
                                                {uploadResults.errors.map((error, index) => (
                                                    <div key={index} className="p-2 bg-red-50 rounded mb-2">
                                                        <p className="text-sm">
                                                            <strong>{error.empCode}</strong> - {error.empName}: {error.error}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onClose}>
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

export default PayslipManagement;
