import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/react';
import companyService from '../../services/companyService';
import RecentHireCard from './RecentHireCard';

const RecentHires = ({ onViewEmployee }) => {
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentHires();
    }, []);

    const fetchRecentHires = async () => {
        setLoading(true);
        try {
            const response = await companyService.getMyCompanyDashboard();
            if (response?.data?.success) {
                setRecentEmployees(response.data.data.recentEmployees || []);
            }
        } catch (error) {
            console.error('Error fetching recent hires:', error);
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

    if (loading) {
        return (
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Recent Hires</h2>
                <Card className="shadow-sm">
                    <CardBody className="py-8 text-center">
                        <p className="text-default-500">Loading...</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (recentEmployees.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Hires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {recentEmployees.map((emp) => (
                    <RecentHireCard
                        key={emp.id}
                        employee={emp}
                        onClick={onViewEmployee}
                        formatDate={formatDate}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentHires;
