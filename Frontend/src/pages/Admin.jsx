import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { userService } from '@/services';
import UserManagementTable from '@/components/admin/UserManagementTable';
import DataManagement from '@/components/admin/DataManagement';
import ConfirmModal from '@/components/ui/ConfirmModal';

import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [selectedTab, setSelectedTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isLoading: false
    });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers();
            if (response.data?.success) {
                setUsers(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTab === 'users') {
            fetchUsers();
        }
    }, [selectedTab]);

    const handleUploadSuccess = () => {
        // Refresh users if on users tab, or just notify
        if (selectedTab === 'users') {
            fetchUsers();
        }
    };

    const handleDeleteUser = (userId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user/employee? This action cannot be undone and will delete all associated data.',
            confirmText: 'Delete',
            confirmColor: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    const response = await userService.deleteUser(userId);
                    if (response.data?.success) {
                        fetchUsers();
                    } else {
                        alert('Failed to delete user');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
                }
            }
        });
    };

    const handleViewUser = (user) => {
        if (user.role === 'employer') {
            navigate(`/admin/employer/${user.id}`);
        } else if (user.role === 'employee') {
            navigate(`/admin/employee/${user.id}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-default-500">Manage employees, uploads, and system data</p>
                </div>

                <div className="flex w-full flex-col">
                    <Tabs
                        aria-label="Admin Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-primary",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "group-data-[selected=true]:text-primary"
                        }}
                        selectedKey={selectedTab}
                        onSelectionChange={setSelectedTab}
                    >
                        <Tab
                            key="users"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="lucide:users" />
                                    <span>User Management</span>
                                </div>
                            }
                        >
                            <div className="pt-6">
                                <UserManagementTable
                                    users={users}
                                    loading={loading}
                                    onDelete={handleDeleteUser}
                                    onView={handleViewUser}
                                />
                            </div>
                        </Tab>

                        <Tab
                            key="data"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Icon icon="lucide:database" />
                                    <span>Data Management</span>
                                </div>
                            }
                        >
                            <div className="pt-6">
                                <DataManagement />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
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
        </div>
    );
};

export default Admin;
