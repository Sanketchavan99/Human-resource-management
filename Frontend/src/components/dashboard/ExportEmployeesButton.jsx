import React, { useState } from 'react';
import { Button, Spinner, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import companyService from '../../services/companyService';

const ExportEmployeesButton = ({ companyName }) => {
    const [exporting, setExporting] = useState(false);

    const handleExportToExcel = async () => {
        setExporting(true);
        try {
            const response = await companyService.exportEmployeesToExcel();
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `employees_${companyName || 'export'}_${Date.now()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            addToast({
                title: 'Success',
                description: 'Employees exported successfully',
                color: 'success',
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            addToast({
                title: 'Error',
                description: 'Error exporting employees data',
                color: 'danger',
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button
            color="success"
            variant="flat"
            startContent={exporting ? <Spinner size="sm" /> : <Icon icon="lucide:download" />}
            onClick={handleExportToExcel}
            isDisabled={exporting}
        >
            {exporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
    );
};

export default ExportEmployeesButton;
