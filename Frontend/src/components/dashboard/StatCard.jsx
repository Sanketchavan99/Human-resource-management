import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

const StatCard = ({ icon, label, value, subLabel, status = 'neutral', onClick }) => {
    const statusConfig = {
        neutral: {
            iconBg: 'bg-default-100',
            iconColor: 'text-default-600',
            border: 'border-default-200',
        },
        success: {
            iconBg: 'bg-success/10',
            iconColor: 'text-success',
            border: 'border-success/20',
        },
        warning: {
            iconBg: 'bg-warning/10',
            iconColor: 'text-warning',
            border: 'border-warning/20',
        },
        danger: {
            iconBg: 'bg-danger/10',
            iconColor: 'text-danger',
            border: 'border-danger/20',
        },
        active: {
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            border: 'border-primary/20',
        },
    };

    const config = statusConfig[status] || statusConfig.neutral;

    return (
        <Card
            isPressable={!!onClick}
            onPress={onClick}
            className={`h-full border ${config.border} shadow-sm transition-all duration-150 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-primary/40 hover:-translate-y-[1px]' : ''
                }`}
        >
            <CardBody className="flex items-center gap-3 p-4">
                <div className={`flex-shrink-0 rounded-lg p-2.5 ${config.iconBg} ${config.iconColor}`}>
                    <Icon icon={icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-default-500 text-center">
                        {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground truncate text-center">{value}</p>
                    {subLabel && (
                        <p className="mt-0.5 text-xs text-default-500 truncate text-center">{subLabel}</p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default StatCard;