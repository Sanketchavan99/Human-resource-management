import React from 'react';
import { Card, CardBody } from '@heroui/react';

const RecentHireCard = ({ employee, onClick, formatDate }) => {
    const fullName = employee.firstName && employee.lastName
        ? `${employee.firstName} ${employee.lastName}`
        : employee.name;

    return (
        <Card
            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClick(employee)}
        >
            <CardBody className="p-4">
                <p className="font-medium text-sm truncate">{fullName}</p>
                <p className="text-xs text-primary font-semibold">{employee.empCode}</p>
                <p className="text-xs text-default-500 truncate">{employee.designation || '—'}</p>
                <p className="text-xs text-default-400 mt-1">{formatDate(employee.createdAt)}</p>
            </CardBody>
        </Card>
    );
};

export default RecentHireCard;
