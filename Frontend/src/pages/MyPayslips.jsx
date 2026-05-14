import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Select, SelectItem, Spinner } from '@heroui/react';
import { Download, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import payslipService from '../services/payslipService';

const MyPayslips = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonthAvailable, setCurrentMonthAvailable] = useState(false);
    const [currentMonthPayslip, setCurrentMonthPayslip] = useState(null);
    const [filterYear, setFilterYear] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentDate = new Date();
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    useEffect(() => {
        fetchPayslips();
        checkCurrentMonth();
    }, []);

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const response = await payslipService.getMyPayslips();
            setPayslips(response.payslips || []);
        } catch (error) {
            console.error('Failed to fetch payslips:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkCurrentMonth = async () => {
        try {
            const response = await payslipService.checkCurrentMonthAvailability();
            setCurrentMonthAvailable(response.available);
            setCurrentMonthPayslip(response.payslip);
        } catch (error) {
            console.error('Failed to check availability:', error);
        }
    };

    const handleDownload = async (id) => {
        try {
            await payslipService.downloadPayslip(id);
        } catch (error) {
            alert(error.message || 'Failed to download payslip');
        }
    };

    const getMonthName = (monthNum) => {
        return months[monthNum - 1] || monthNum;
    };

    const filteredPayslips = filterYear
        ? payslips.filter(p => p.year === parseInt(filterYear))
        : payslips;

    const years = [...new Set(payslips.map(p => p.year))].sort((a, b) => b - a).map(y => ({ label: y.toString(), value: y }));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-6">My Payslips</h1>

                {/* Current Month Availability Banner */}
                <Card className={`mb-6 ${currentMonthAvailable ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-orange-50 to-orange-100'}`}>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {currentMonthAvailable ? (
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                ) : (
                                    <XCircle className="w-12 h-12 text-orange-600" />
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {currentMonth} {currentYear} Payslip
                                    </h2>
                                    <p className={`text-lg ${currentMonthAvailable ? 'text-green-700' : 'text-orange-700'}`}>
                                        {currentMonthAvailable
                                            ? 'Your payslip is ready to download!'
                                            : 'Payslip not yet available'}
                                    </p>
                                </div>
                            </div>
                            {currentMonthAvailable && currentMonthPayslip && (
                                <Button
                                    color="success"
                                    size="lg"
                                    onPress={() => handleDownload(currentMonthPayslip.id)}
                                    startContent={<Download className="w-5 h-5" />}
                                >
                                    Download Current Month
                                </Button>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Filter Section */}
                {years.length > 0 && (
                    <Card className="mb-6">
                        <CardBody>
                            <div className="flex items-end gap-4">
                                <Select
                                    label="Filter by Year"
                                    placeholder="All Years"
                                    selectedKeys={filterYear ? [filterYear] : []}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="max-w-xs"
                                    startContent={<Calendar className="w-5 h-5" />}
                                >
                                    <SelectItem key="" value="">All Years</SelectItem>
                                    {years.map((y) => (
                                        <SelectItem key={y.value} value={y.value}>
                                            {y.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                {filterYear && (
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={() => setFilterYear('')}
                                    >
                                        Clear Filter
                                    </Button>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Payslips Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <h2 className="text-xl font-semibold">
                                Payslip History ({filteredPayslips.length})
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="lg" />
                            </div>
                        ) : filteredPayslips.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-xl text-gray-500 mb-2">No Payslips Available</p>
                                <p className="text-sm text-gray-400">
                                    Your payslips will appear here once they are uploaded by your employer.
                                </p>
                            </div>
                        ) : (
                            <Table aria-label="My payslips table">
                                <TableHeader>
                                    <TableColumn>MONTH</TableColumn>
                                    <TableColumn>YEAR</TableColumn>
                                    <TableColumn>GROSS INCOME</TableColumn>
                                    <TableColumn>DEDUCTIONS</TableColumn>
                                    <TableColumn>NET AMOUNT</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>ACTION</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayslips.map((payslip) => (
                                        <TableRow key={payslip.id}>
                                            <TableCell className="font-medium">
                                                {getMonthName(payslip.month)}
                                            </TableCell>
                                            <TableCell>{payslip.year}</TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                ₹{parseFloat(payslip.grossIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-red-600">
                                                ₹{parseFloat(payslip.grossDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="font-bold text-blue-600">
                                                ₹{parseFloat(payslip.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <Chip color="success" size="sm" variant="flat">
                                                    Available
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    onPress={() => handleDownload(payslip.id)}
                                                    startContent={<Download className="w-4 h-4" />}
                                                >
                                                    Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
};

export default MyPayslips;
