import React, { useState, useEffect } from 'react';
import { Spinner, Tabs, Tab, useDisclosure, Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import companyService from '../services/companyService';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentHires from '../components/dashboard/RecentHires';
import CompanyLogoSection from '../components/dashboard/CompanyLogoSection';
import EmployeeTable from '../components/dashboard/EmployeeTable';
import EmployeeDetailModal from '../components/dashboard/EmployeeDetailModal';
import ExportEmployeesButton from '../components/dashboard/ExportEmployeesButton';

const CompanyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();

    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch company info on mount
    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        setLoading(true);
        try {
            const response = await companyService.getMyCompanyDashboard();
            if (response?.data?.success) {
                setCompanyInfo(response.data.data.company);
            }
        } catch (error) {
            console.error('Error fetching company info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewEmployee = async (employee) => {
        setSelectedEmployee(employee);
        onOpen();
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-default-50">
                <Spinner size="lg" />
            </div>
        );
    }

    const owner = companyInfo?.owner || {};

    return (
        <div className="min-h-screen bg-default-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* ------------------------------ Page Header ------------------------------ */}
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-lg font-semibold text-foreground leading-tight sm:text-xl">
                        Welcome back, {owner.name || 'Admin'}! 👋
                    </h1>
                    <p className="text-xs text-default-500 mt-1 sm:text-sm">
                        {companyInfo?.name} • Registered on {formatDate(companyInfo?.createdAt)}
                    </p>
                </header>

                {/* Stats Overview - Self-contained component */}
                <DashboardStats />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card isPressable onPress={() => navigate('/company/add-employees')} className="hover:shadow-lg transition-shadow">
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <Icon icon="lucide:user-plus" className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Add Employees</h3>
                                <p className="text-sm text-default-500">Upload Excel or manually add employees</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card isPressable onPress={() => navigate('/company/payslips')} className="hover:shadow-lg transition-shadow">
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="rounded-full bg-success/10 p-3">
                                <Icon icon="lucide:file-text" className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Manage Payslips</h3>
                                <p className="text-sm text-default-500">Upload and manage employee payslips</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card isPressable onPress={() => navigate('/company/payslip-documents')} className="hover:shadow-lg transition-shadow">
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="rounded-full bg-secondary/10 p-3">
                                <Icon icon="mdi:file-document" className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Payslip Documents</h3>
                                <p className="text-sm text-default-500">Upload payslip files for employees</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card isPressable onPress={() => navigate('/company/offer-letters')} className="hover:shadow-lg transition-shadow">
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="rounded-full bg-warning/10 p-3">
                                <Icon icon="lucide:file-signature" className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Offer Letters</h3>
                                <p className="text-sm text-default-500">Upload and manage employee offer letters</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs aria-label="Dashboard tabs" size="lg" color="primary" className="mt-6">
                    <Tab key="overview" title={
                        <div className="flex items-center gap-2">
                            <Icon icon="lucide:layout-dashboard" />
                            <span>Overview</span>
                        </div>
                    }>
                        {/* Recent Hires - Self-contained component */}
                        <RecentHires onViewEmployee={handleViewEmployee} />
                    </Tab>

                    <Tab key="employees" title={
                        <div className="flex items-center gap-2">
                            <Icon icon="lucide:users" />
                            <span>Employees</span>
                        </div>
                    }>
                        <div className="mt-6">
                            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-base font-semibold text-foreground sm:text-lg">All Employees</h2>
                                {/* Export Button - Self-contained component */}
                                <ExportEmployeesButton companyName={companyInfo?.name} />
                            </div>

                            {/* Employee Table - Self-contained component */}
                            <EmployeeTable onViewEmployee={handleViewEmployee} />
                        </div>
                    </Tab>

                    <Tab key="settings" title={
                        <div className="flex items-center gap-2">
                            <Icon icon="lucide:settings" />
                            <span>Settings</span>
                        </div>
                    }>
                        <div className="mt-6">
                            <h2 className="text-base font-semibold text-foreground mb-4 sm:text-lg">Company Settings</h2>
                            {/* Company Logo Section - Self-contained component */}
                            <CompanyLogoSection
                                company={companyInfo}
                                onLogoUpdated={fetchCompanyInfo}
                            />
                        </div>
                    </Tab>
                </Tabs>

                {/* Employee Detail Modal */}
                <EmployeeDetailModal
                    isOpen={isOpen}
                    onClose={onClose}
                    employee={selectedEmployee}
                />
            </div>
        </div>
    );
};

export default CompanyDashboard;
