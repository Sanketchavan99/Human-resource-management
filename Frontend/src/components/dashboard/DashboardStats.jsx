import React, { useState, useEffect } from 'react';
import companyService from '../../services/companyService';
import StatCard from './StatCard';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        recentHires: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await companyService.getMyCompanyDashboard();
            if (response?.data?.success) {
                const data = response.data.data;
                setStats({
                    totalEmployees: data.stats?.totalEmployees || 0,
                    activeEmployees: data.stats?.activeEmployees || 0,
                    inactiveEmployees: data.stats?.inactiveEmployees || 0,
                    recentHires: data.recentEmployees?.length || 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-default-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                icon="lucide:users"
                label="Total Employees"
                value={stats.totalEmployees}
                color="primary"
            />
            <StatCard
                icon="lucide:user-check"
                label="Active"
                value={stats.activeEmployees}
                color="success"
            />
            <StatCard
                icon="lucide:user-x"
                label="Inactive"
                value={stats.inactiveEmployees}
                color="warning"
            />
            <StatCard
                icon="lucide:user-plus"
                label="Recent Hires"
                value={stats.recentHires}
                color="secondary"
            />
        </div>
    );
};

export default DashboardStats;
