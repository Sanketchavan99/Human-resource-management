import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, CardBody, Button, Spinner, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { userService } from '../services';

const EmployerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployerDetails();
    }, [id]);

    const fetchEmployerDetails = async () => {
        try {
            const response = await userService.getEmployerDetails(id);
            if (response?.data?.success) {
                setData(response.data.data);
            } else {
                console.error('Failed to fetch employer details');
            }
        } catch (error) {
            console.error('Error fetching employer details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading employer details..." />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-xl text-default-500">Employer not found</p>
                <Button color="primary" onClick={() => navigate('/admin')}>
                    Go Back
                </Button>
            </div>
        );
    }

    const { user, company, stats, recentEmployees, documents } = data;

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
                console.error('Failed to download document');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    const DocItem = ({ doc }) => (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon icon="lucide:file-text" width={24} />
                </div>
                <div>
                    <p className="font-medium capitalize">{doc.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-tiny text-default-500">{doc.filename}</p>
                    {doc.uploadedAt && (
                        <p className="text-tiny text-default-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
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
                    <div className="flex items-center gap-4">
                        {company.logoPath ? (
                            <img src={company.logoPath} alt={company.name} className="w-16 h-16 rounded-lg object-contain bg-white border" />
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icon icon="lucide:building-2" width={32} />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {company.name}
                                <Chip size="sm" color="secondary" variant="flat">{company.code}</Chip>
                            </h1>
                            <p className="text-default-500">Owner: {user.name} ({user.email})</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Chip variant="flat" color="primary">
                            Member since {new Date(company.createdAt).toLocaleDateString()}
                        </Chip>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                    <CardBody className="flex flex-row items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-default-600">Total Employees</p>
                            <h3 className="text-3xl font-bold text-primary">{stats.totalEmployees}</h3>
                        </div>
                        <div className="p-3 bg-primary/20 rounded-full text-primary">
                            <Icon icon="lucide:users" width={24} />
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-success/5 border-success/20">
                    <CardBody className="flex flex-row items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-default-600">Active Employees</p>
                            <h3 className="text-3xl font-bold text-success">{stats.activeEmployees}</h3>
                        </div>
                        <div className="p-3 bg-success/20 rounded-full text-success">
                            <Icon icon="lucide:user-check" width={24} />
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-default/5 border-default/20">
                    <CardBody className="flex flex-row items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium text-default-600">Inactive Employees</p>
                            <h3 className="text-3xl font-bold text-default-600">{stats.inactiveEmployees}</h3>
                        </div>
                        <div className="p-3 bg-default/20 rounded-full text-default-600">
                            <Icon icon="lucide:user-x" width={24} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Employees */}
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:history" />
                                Recently Added Employees
                            </h3>
                            <Table aria-label="Recent employees table">
                                <TableHeader>
                                    <TableColumn>NAME</TableColumn>
                                    <TableColumn>EMP CODE</TableColumn>
                                    <TableColumn>DESIGNATION</TableColumn>
                                    <TableColumn>JOINED</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No employees added yet">
                                    {recentEmployees.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <User
                                                    name={emp.name}
                                                    description={emp.email}
                                                    avatarProps={{
                                                        radius: "sm",
                                                        className: "w-8 h-8 text-tiny"
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{emp.empCode}</TableCell>
                                            <TableCell>{emp.designation}</TableCell>
                                            <TableCell>{new Date(emp.dateOfJoining || emp.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>

                    {/* Employer Documents */}
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:file-stack" />
                                Employer Documents
                            </h3>
                            {documents && documents.length > 0 ? (
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
                </div>

                {/* Company Info */}
                <div className="space-y-6">
                    <Card>
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Icon icon="lucide:info" />
                                Company Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Company Name</p>
                                    <p className="font-medium">{company.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Company Code</p>
                                    <Chip size="sm" variant="flat" color="secondary">{company.code}</Chip>
                                </div>
                                <Divider />
                                <div>
                                    <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Contact Person</p>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-medium text-primary">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="font-medium">{user.phoneNumber || '—'}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployerDetailPage;
