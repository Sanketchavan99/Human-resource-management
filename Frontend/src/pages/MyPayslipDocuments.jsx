import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import payslipDocumentService from '../services/payslipDocumentService';

const MyPayslipDocuments = () => {
    const [payslipDocuments, setPayslipDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchMyPayslipDocuments();
    }, []);

    const fetchMyPayslipDocuments = async () => {
        try {
            setLoading(true);
            const response = await payslipDocumentService.getMyPayslipDocuments();
            setPayslipDocuments(response.payslipDocuments || []);
        } catch (error) {
            console.error('Failed to fetch payslip documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            await payslipDocumentService.downloadPayslipDocument(id);
        } catch (error) {
            alert(error.message || 'Failed to download payslip document');
        }
    };

    const getMonthName = (monthNum) => {
        return months[monthNum - 1] || monthNum;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">My Payslip Documents</h1>
                    <p className="text-gray-600">View and download your payslip documents</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:file-document" className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">Available Payslip Documents</h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="lg" />
                            </div>
                        ) : payslipDocuments.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="mdi:file-document-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">No payslip documents available</p>
                                <p className="text-gray-400 text-sm mt-2">Your payslip documents will appear here once uploaded</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <Table aria-label="My payslip documents table">
                                        <TableHeader>
                                            <TableColumn>MONTH/YEAR</TableColumn>
                                            <TableColumn>COMPANY</TableColumn>
                                            <TableColumn>UPLOADED DATE</TableColumn>
                                            <TableColumn>ACTIONS</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {payslipDocuments.map((doc) => (
                                                <TableRow key={doc.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Icon icon="mdi:calendar-month" className="w-5 h-5 text-primary" />
                                                            <span className="font-medium">
                                                                {getMonthName(doc.month)} {doc.year}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{doc.company?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip color="success" size="sm" variant="flat">
                                                            {new Date(doc.createdAt).toLocaleDateString()}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={() => handleDownload(doc.id)}
                                                            startContent={<Icon icon="mdi:download" className="w-4 h-4" />}
                                                        >
                                                            Download
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-3">
                                    {payslipDocuments.map((doc) => (
                                        <Card key={doc.id} className="shadow-sm">
                                            <CardBody className="gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Icon icon="mdi:calendar-month" className="w-5 h-5 text-primary" />
                                                            <span className="font-semibold text-lg">
                                                                {getMonthName(doc.month)} {doc.year}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            Company: {doc.company?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Chip color="success" size="sm" variant="flat">
                                                        Available
                                                    </Chip>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    className="w-full"
                                                    onPress={() => handleDownload(doc.id)}
                                                    startContent={<Icon icon="mdi:download" className="w-4 h-4" />}
                                                >
                                                    Download Payslip
                                                </Button>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Icon icon="mdi:information-outline" className="w-5 h-5" />
                                        <span className="text-sm">
                                            Total documents available: <strong>{payslipDocuments.length}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
};

export default MyPayslipDocuments;
