import React, { useState, useEffect } from 'react';
import {
    Card, CardBody, Input, Table, TableHeader, TableBody,
    TableRow, TableColumn, TableCell, Chip, Button, Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import companyService from '../../services/companyService';

const EmployeeTable = ({ onViewEmployee }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

    // Fetch employees on mount and when search/page changes
    useEffect(() => {
        fetchEmployees();
    }, [searchQuery, pagination.page]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await companyService.getMyCompanyEmployees({
                search: searchQuery,
                page: pagination.page,
                limit: pagination.limit
            });
            if (response?.data?.success) {
                setEmployees(response.data.data.employees);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.pagination.total,
                    totalPages: response.data.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
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

    const getEmployeeStatus = (lastWorkingDate) => {
        if (!lastWorkingDate) return 'active';
        const today = new Date();
        const lastDate = new Date(lastWorkingDate);
        return lastDate > today ? 'active' : 'inactive';
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <Card className="shadow-md">
            <CardBody>
                <div className="mb-4">
                    <Input
                        placeholder="Search employees by name, code, email, or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startContent={<Icon icon="lucide:search" />}
                        variant="bordered"
                        isClearable
                        onClear={() => setSearchQuery('')}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spinner size="lg" />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-8 text-default-500">
                        <Icon icon="lucide:users-round" width="48" height="48" className="mx-auto mb-2 opacity-50" />
                        <p>No employees found</p>
                        <p className="text-sm mt-2">Start by adding employees to your company</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table aria-label="Employees table">
                                <TableHeader>
                                    <TableColumn>EMP CODE</TableColumn>
                                    <TableColumn>NAME</TableColumn>
                                    <TableColumn>EMAIL</TableColumn>
                                    <TableColumn>PHONE</TableColumn>
                                    <TableColumn>DESIGNATION</TableColumn>
                                    <TableColumn>JOINING DATE</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <span className="font-medium">{emp.empCode}</span>
                                            </TableCell>
                                            <TableCell>
                                                {emp.firstName && emp.lastName
                                                    ? `${emp.firstName} ${emp.lastName}`
                                                    : emp.name || '—'}
                                            </TableCell>
                                            <TableCell>{emp.email || '—'}</TableCell>
                                            <TableCell>{emp.phoneNumber || '—'}</TableCell>
                                            <TableCell>{emp.designation || '—'}</TableCell>
                                            <TableCell>{formatDate(emp.dateOfJoining)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getEmployeeStatus(emp.lastWorkingDate) === 'active' ? 'success' : 'default'}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {getEmployeeStatus(emp.lastWorkingDate)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                    onClick={() => onViewEmployee(emp)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {employees.length > 0 && (
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-sm text-default-500">
                                    Showing {employees.length} of {pagination.total} employees
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        isDisabled={pagination.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        isDisabled={pagination.page >= pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
};

export default EmployeeTable;
