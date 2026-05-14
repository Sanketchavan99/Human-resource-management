import React, { useState, useEffect } from 'react';
import {
    Tabs,
    Tab,
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Spinner,
    Chip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { adminService, userService } from '@/services';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/services/api';

const DataManagement = () => {
    const [selectedTab, setSelectedTab] = useState('addresses');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isLoading: false
    });

    // Fetch data based on selected tab
    useEffect(() => {
        fetchData();
    }, [selectedTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let response;
            switch (selectedTab) {
                case 'addresses':
                    response = await adminService.addresses.getAll();
                    break;
                case 'bankDetails':
                    response = await adminService.bankDetails.getAll();
                    break;
                case 'emergencyContacts':
                    response = await adminService.emergencyContacts.getAll();
                    break;
                case 'familyMembers':
                    response = await adminService.familyMembers.getAll();
                    break;
                case 'nominees':
                    response = await adminService.nominees.getAll();
                    break;
                case 'centers':
                    response = await adminService.centers.getAll();
                    break;
                case 'companies':
                    response = await adminService.companies.getAll();
                    break;
                case 'documents':
                    response = await userService.getAllUserDocuments();
                    break;
                default:
                    response = null;
            }

            if (response?.data?.success) {
                setData(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Item',
            message: 'Are you sure you want to delete this item? This action cannot be undone.',
            confirmText: 'Delete',
            confirmColor: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    let response;
                    switch (selectedTab) {
                        case 'addresses':
                            response = await adminService.addresses.delete(id);
                            break;
                        case 'bankDetails':
                            response = await adminService.bankDetails.delete(id);
                            break;
                        case 'emergencyContacts':
                            response = await adminService.emergencyContacts.delete(id);
                            break;
                        case 'familyMembers':
                            response = await adminService.familyMembers.delete(id);
                            break;
                        case 'nominees':
                            response = await adminService.nominees.delete(id);
                            break;
                        case 'centers':
                            response = await adminService.centers.delete(id);
                            break;
                        case 'companies':
                            response = await adminService.companies.delete(id);
                            break;
                        default:
                            return;
                    }

                    if (response?.data?.success) {
                        fetchData(); // Refresh data
                    } else {
                        alert('Failed to delete item');
                    }
                } catch (error) {
                    console.error('Error deleting item:', error);
                    alert('Error deleting item');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
                }
            }
        });
    };

    const handleDownload = async (url, filename) => {
        console.log(url, filename);
        try {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);

            link.click();
            link.remove();

        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document');
        }
    };

    // Helper for document download button
    const DocDownloadButton = ({ path, empCode, label }) => {
        if (!path) return <Chip size="sm" variant="flat" color="danger">Missing</Chip>;
        const url = `${import.meta.env.VITE_API_URL}/${path.split('\\').join('/')}`;
        console.log(url);
        return (
            <Button
                size="sm"
                variant="flat"
                color="success"
                startContent={<Icon icon="lucide:download" />}
                onPress={() => handleDownload(url, `${label}-${empCode}.pdf`)}
            >
                {label || 'Download'}
            </Button>
        );
    };

    const renderAddressesTable = () => (
        <Table aria-label="Addresses table">
            <TableHeader>
                <TableColumn>UNIQUE CODE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>ADDRESS</TableColumn>
                <TableColumn>CITY</TableColumn>
                <TableColumn>STATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No addresses found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell><span className="font-medium text-primary">{item.User?.empCode || 'N/A'}</span></TableCell>
                        <TableCell>{item.User?.name || item.userId || 'N/A'}</TableCell>
                        <TableCell>
                            <Chip size="sm" variant="flat" color="primary">{item.type}</Chip>
                        </TableCell>
                        <TableCell>{item.addressLine || 'N/A'}</TableCell>
                        <TableCell>{item.city || 'N/A'}</TableCell>
                        <TableCell>{item.state || 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderBankDetailsTable = () => (
        <Table aria-label="Bank details table">
            <TableHeader>
                <TableColumn>UNIQUE CODE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>BANK NAME</TableColumn>
                <TableColumn>ACCOUNT NUMBER</TableColumn>
                <TableColumn>IFSC CODE</TableColumn>
                <TableColumn>ACCOUNT TYPE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No bank details found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell><span className="font-medium text-primary">{item.User?.empCode || 'N/A'}</span></TableCell>
                        <TableCell>{item.User?.name || item.userId || 'N/A'}</TableCell>
                        <TableCell>{item.bankName || 'N/A'}</TableCell>
                        <TableCell>{item.accountNumber ? `**** ${item.accountNumber.slice(-4)}` : 'N/A'}</TableCell>
                        <TableCell>{item.ifscCode || 'N/A'}</TableCell>
                        <TableCell>{item.accountType || 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderEmergencyContactsTable = () => (
        <Table aria-label="Emergency contacts table">
            <TableHeader>
                <TableColumn>UNIQUE CODE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>CONTACT NAME</TableColumn>
                <TableColumn>RELATION</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No emergency contacts found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell><span className="font-medium text-primary">{item.User?.empCode || 'N/A'}</span></TableCell>
                        <TableCell>{item.User?.name || item.userId || 'N/A'}</TableCell>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>{item.relation || 'N/A'}</TableCell>
                        <TableCell>{item.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderFamilyMembersTable = () => (
        <Table aria-label="Family members table">
            <TableHeader>
                <TableColumn>UNIQUE CODE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>MEMBER NAME</TableColumn>
                <TableColumn>RELATION</TableColumn>
                <TableColumn>DOB</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No family members found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell><span className="font-medium text-primary">{item.User?.empCode || 'N/A'}</span></TableCell>
                        <TableCell>{item.User?.name || item.userId || 'N/A'}</TableCell>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>{item.relation || 'N/A'}</TableCell>
                        <TableCell>{item.dob ? new Date(item.dob).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{item.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderNomineesTable = () => (
        <Table aria-label="Nominees table">
            <TableHeader>
                <TableColumn>UNIQUE CODE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>NOMINEE NAME</TableColumn>
                <TableColumn>RELATION</TableColumn>
                <TableColumn>SHARE %</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No nominees found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell><span className="font-medium text-primary">{item.User?.empCode || 'N/A'}</span></TableCell>
                        <TableCell>{item.User?.name || item.userId || 'N/A'}</TableCell>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>{item.relation || 'N/A'}</TableCell>
                        <TableCell>
                            <Chip size="sm" variant="flat" color="success">{item.sharePercentage}%</Chip>
                        </TableCell>
                        <TableCell>{item.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderCentersTable = () => (
        <Table aria-label="Centers table">
            <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>CITY</TableColumn>
                <TableColumn>STATE</TableColumn>
                <TableColumn>ZONE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No centers found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>{item.city || 'N/A'}</TableCell>
                        <TableCell>{item.state || 'N/A'}</TableCell>
                        <TableCell>{item.zone || 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderCompaniesTable = () => (
        <Table aria-label="Companies table">
            <TableHeader>
                <TableColumn>UNIQUE CODE</TableColumn>
                <TableColumn>OWNER</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No companies found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <span className="font-medium text-primary">{item.owner?.empCode || 'N/A'}</span>
                        </TableCell>
                        <TableCell>{item.owner?.name || 'N/A'}</TableCell>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Icon icon="lucide:trash-2" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderDocumentsTable = () => (
        <Table aria-label="User documents table">
            <TableHeader>
                <TableColumn>EMP CODE</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ID CARD</TableColumn>
                <TableColumn>ESIC CARD</TableColumn>
                <TableColumn>OFFER LETTER</TableColumn>
                <TableColumn>PERSONAL DOCS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No documents found" isLoading={loading} loadingContent={<Spinner />}>
                {data.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <span className="font-medium text-primary">{item.empCode || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{item.name || 'Unknown'}</span>
                                <span className="text-tiny text-default-400">{item.designation || item.role}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <DocDownloadButton path={item.idCardPath} empCode={item.empCode} label="ID Card" />
                        </TableCell>
                        <TableCell>
                            <DocDownloadButton path={item.esicCardPath} empCode={item.empCode} label="ESIC Card" />
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <DocDownloadButton path={item.offerLetterPath} empCode={item.empCode} label="Offer Letter" />
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1 flex-wrap">
                                {item.aadharPath && <Button size="sm" variant="flat" color="success" endContent={<Icon icon="lucide:download" onClick={() => handleDownload(`${import.meta.env.VITE_API_URL}/${item.aadharPath.split('\\').join('/')}`, `${item.empCode}-Aadhar`)} />} >Aadhar</Button>}
                                {item.panCardPath && <Button size="sm" variant="flat" color="success" endContent={<Icon icon="lucide:download" onClick={() => handleDownload(`${import.meta.env.VITE_API_URL}/${item.panCardPath.split('\\').join('/')}`, `${item.empCode}-PanCard`)} />} >Pan</Button>}
                                {item.drivingLicensePath && <Button size="sm" variant="flat" color="success" endContent={<Icon icon="lucide:download" onClick={() => handleDownload(`${import.meta.env.VITE_API_URL}/${item.drivingLicensePath.split('\\').join('/')}`, `${item.empCode}-DrivingLicense`)} />} >DrivingLicense</Button>}
                                {!item.aadharPath && !item.panCardPath && !item.drivingLicensePath && <span className="text-default-400 text-sm text-center">-</span>}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 'addresses':
                return renderAddressesTable();
            case 'bankDetails':
                return renderBankDetailsTable();
            case 'emergencyContacts':
                return renderEmergencyContactsTable();
            case 'familyMembers':
                return renderFamilyMembersTable();
            case 'nominees':
                return renderNomineesTable();
            case 'centers':
                return renderCentersTable();
            case 'companies':
                return renderCompaniesTable();
            case 'documents':
                return renderDocumentsTable();
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <Card>
            <CardBody>
                <Tabs
                    aria-label="Data management tabs"
                    selectedKey={selectedTab}
                    onSelectionChange={setSelectedTab}
                    variant="underlined"
                    color="primary"
                >
                    <Tab
                        key="addresses"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:map-pin" />
                                <span>Addresses</span>
                            </div>
                        }
                    />
                    <Tab
                        key="bankDetails"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:credit-card" />
                                <span>Bank Details</span>
                            </div>
                        }
                    />
                    <Tab
                        key="emergencyContacts"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:phone-call" />
                                <span>Emergency Contacts</span>
                            </div>
                        }
                    />
                    <Tab
                        key="familyMembers"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:users" />
                                <span>Family Members</span>
                            </div>
                        }
                    />
                    <Tab
                        key="nominees"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:user-check" />
                                <span>Nominees</span>
                            </div>
                        }
                    />
                    <Tab
                        key="centers"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:building" />
                                <span>Centers</span>
                            </div>
                        }
                    />
                    <Tab
                        key="companies"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:briefcase" />
                                <span>Companies</span>
                            </div>
                        }
                    />
                    <Tab
                        key="documents"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:file-stack" />
                                <span>Documents</span>
                            </div>
                        }
                    />
                </Tabs>

                <div className="mt-6">
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-sm text-default-500">
                            Total: {data.length} items
                        </p>
                        <Button
                            size="sm"
                            color="primary"
                            startContent={<Icon icon="lucide:refresh-cw" />}
                            onClick={fetchData}
                        >
                            Refresh
                        </Button>
                    </div>
                    {renderContent()}
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
            </CardBody>
        </Card>
    );
};

export default DataManagement;
