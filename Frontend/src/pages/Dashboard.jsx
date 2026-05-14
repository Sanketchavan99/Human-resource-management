import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Progress,
    Skeleton,
    Chip,
    Avatar,
    Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { userService, offerLetterService } from '../services';

/* ---------------------------- Skeleton Loader ---------------------------- */

const DashboardSkeleton = () => (
    <div className="min-h-screen bg-default-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40 rounded-lg" />
                        <Skeleton className="h-4 w-28 rounded-lg" />
                    </div>
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardBody className="space-y-4">
                        <Skeleton className="h-5 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </CardBody>
                </Card>
                <div className="space-y-4">
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        </div>
    </div>
);

/* ----------------------------- UI Subcomponents ----------------------------- */

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

const ActionCard = ({ icon, title, subtitle, onClick }) => (
    <Card
        isPressable
        onPress={onClick}
        className="h-full border border-default-200 shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:border-primary/40 hover:shadow-md"
    >
        <CardBody className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
                <div className="rounded-md bg-default-100 p-1.5">
                    <Icon icon={icon} className="h-4 w-4 text-default-600" />
                </div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
            </div>
            {subtitle && (
                <p className="text-xs leading-relaxed text-default-500">{subtitle}</p>
            )}
        </CardBody>
    </Card>
);

/* ------------------------------ Main Component ------------------------------ */

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(false);
    const [downloadingEsic, setDownloadingEsic] = useState(false);
    const [offerLetterData, setOfferLetterData] = useState(null);
    const [downloadingOfferLetter, setDownloadingOfferLetter] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const response = await userService.getMyCompleteProfile();
                if (response?.data?.success) {
                    setProfileData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchOfferLetterData = async () => {
            try {
                const response = await offerLetterService.getMyOfferLetter();
                if (response?.data?.success) {
                    setOfferLetterData(response.data.data);
                }
            } catch (error) {
                // Silently fail if no offer letter exists
                console.log('No offer letter available');
            }
        };

        fetchProfileData();
        fetchOfferLetterData();
    }, [user]);

    const profileCompletion = profileData?.profileCompletion?.totalPercentage || 0;
    const userData = profileData?.user || {};
    const documents = profileData?.documents || [];

    const getCompletionColor = (pct) =>
        pct === 100 ? 'success' : pct >= 60 ? 'primary' : 'warning';

    const handleDownload = async (type, path, code) => {
        if (!path) return;

        const setter = type === 'ID' ? setDownloadingId : setDownloadingEsic;
        const apiCall =
            type === 'ID'
                ? userService.downloadMyIdCard
                : userService.downloadMyEsicCard;

        const ext = type === 'ID' ? 'pdf' : path.split('.').pop();
        const fileName = `${type}-Card-${code || 'employee'}.${ext}`;

        setter(true);
        try {
            const response = await apiCall();
            const blob = new Blob([response.data], {
                type: type === 'ID' ? 'application/pdf' : 'application/octet-stream',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading ${type} card:`, error);
        } finally {
            setter(false);
        }
    };

    const handleDownloadOfferLetter = async () => {
        if (!offerLetterData) return;

        setDownloadingOfferLetter(true);
        try {
            const response = await offerLetterService.downloadOfferLetter();
            const blob = new Blob([response.data], {
                type: 'application/pdf',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Offer-Letter-${userData.empCode || 'employee'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading offer letter:', error);
        } finally {
            setDownloadingOfferLetter(false);
        }
    };

    if (loading) return <DashboardSkeleton />;

    console.log(userData);

    return (
        <div className="min-h-screen bg-default-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* ------------------------------ Page Header ------------------------------ */}
                <header className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <Avatar
                            src={userData.avatarUrl ? `${import.meta.env.VITE_API_URL}/${userData.avatarUrl}` : undefined}
                            name={userData.firstName || 'Employee'}
                            className="h-12 w-12"
                            isBordered
                            color="primary"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-default-500">
                                Welcome back
                            </p>

                            <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
                                {userData.firstName || 'Employee'}
                            </h1>

                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <p className="text-xs text-default-500 truncate">
                                    {userData.designation || 'Team Member'}
                                    {userData.empCode ? ` • ${userData.empCode}` : ''}
                                </p>
                                {userData.company?.name && (
                                    <div className="flex items-center gap-1">
                                        <Icon icon="lucide:building-2" className="h-3 w-3 text-primary" />
                                        <p className="text-md font-medium text-primary truncate">
                                            {userData.company.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Button below on mobile, right on desktop */}
                    <div className="flex justify-start sm:justify-end">
                        <Button
                            variant="solid"
                            color="primary"
                            size="sm"
                            startContent={<Icon icon="lucide:user" className="h-4 w-4" />}
                            onPress={() => navigate('/profile/view')}
                            className="w-full sm:w-auto"
                        >
                            View Profile
                        </Button>
                    </div>
                </header>


                {/* --------------------------- Main Grid Layout --------------------------- */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: Profile & stats */}
                    <section className="space-y-6 lg:col-span-2">
                        {/* Profile completion */}
                        <Card className="border border-default-200 shadow-sm rounded-xl">
                            <CardHeader className="px-5 pt-5 pb-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                {/* Left section */}
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-default-500">
                                        Profile Overview
                                    </p>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Keep your information up to date
                                    </h2>
                                </div>

                                {/* CTA - moves below on mobile */}
                                {profileCompletion < 100 && (
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        className="w-full sm:w-auto mt-2 sm:mt-0"
                                        endContent={<Icon icon="lucide:arrow-right" className="h-4 w-4" />}
                                        onPress={() => navigate('/profile/complete')}
                                    >
                                        Complete Profile
                                    </Button>
                                )}
                            </CardHeader>

                            <CardBody className="px-5 py-4 space-y-5">

                                {/* Progress Row */}
                                <div className="flex flex-col gap-3">
                                    <Progress
                                        value={profileCompletion}
                                        color={getCompletionColor(profileCompletion)}
                                        aria-label="Profile completion"
                                        showValueLabel
                                        label="Profile Completion"
                                        classNames={{
                                            indicator: "bg-gradient-to-r from-primary to-primary-400",
                                        }}
                                    />

                                    <p className="text-xs text-default-600">
                                        {profileCompletion === 100
                                            ? 'Everything looks good.'
                                            : 'Finish pending sections to complete your profile.'}
                                    </p>
                                </div>

                                {/* Missing Fields */}
                                {profileData?.profileCompletion?.missingFields?.length > 0 ? (
                                    <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-md bg-warning/10 p-1.5">
                                                <Icon icon="lucide:alert-circle" className="h-5 w-5 text-warning" />
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <p className="text-sm font-medium text-foreground">
                                                    Information Missing
                                                </p>

                                                <p className="text-xs text-default-600">
                                                    Complete the following sections:
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {profileData.profileCompletion.missingFields.slice(0, 4).map((item, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            size="sm"
                                                            variant="flat"
                                                            color="warning"
                                                            className="text-xs"
                                                        >
                                                            {item.section}
                                                        </Chip>
                                                    ))}

                                                    {profileData.profileCompletion.missingFields.length > 4 && (
                                                        <Chip size="sm" variant="flat" color="default" className="text-xs">
                                                            +{profileData.profileCompletion.missingFields.length - 4} more
                                                        </Chip>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            color="warning"
                                            variant="solid"
                                            className="w-full sm:w-auto"
                                            endContent={<Icon icon="lucide:arrow-right" className="h-4 w-4" />}
                                            onPress={() => navigate('/profile/complete')}
                                        >
                                            Continue Profile Setup
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-4">
                                        <Icon icon="lucide:check-circle-2" className="h-5 w-5 text-success" />
                                        <p className="text-sm font-medium text-success-700">
                                            Your profile is fully completed.
                                        </p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>


                        {/* Stats */}
                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-default-500">
                                    Personal data overview
                                </h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard
                                    icon="lucide:map-pin"
                                    label="Addresses"
                                    value={userData.addresses?.length || 0}
                                    subLabel="Registered addresses"
                                    status="neutral"
                                />
                                <StatCard
                                    icon="lucide:users"
                                    label="Family members"
                                    value={userData.familyMembers?.length || 0}
                                    subLabel="Added to your profile"
                                    status="neutral"
                                />
                                <StatCard
                                    icon="lucide:file-text"
                                    label="Documents"
                                    value={`${documents.length}/7`}
                                    subLabel="Uploaded documents"
                                    status={documents.length >= 5 ? 'neutral' : 'warning'}
                                />
                                <StatCard
                                    icon="lucide:landmark"
                                    label="Bank details"
                                    value={userData.bankDetail ? 'Added' : 'Missing'}
                                    subLabel={userData.bankDetail ? 'Payouts are configured' : 'Required for payouts'}
                                    status={userData.bankDetail ? 'success' : 'danger'}
                                    onClick={
                                        !userData.bankDetail
                                            ? () => navigate('/profile/complete')
                                            : undefined
                                    }
                                />
                            </div>
                        </section>
                    </section>

                    {/* Right: Identity & quick actions */}
                    <aside className="space-y-6">
                        {/* Identity cards */}
                        <Card className="border border-default-200 shadow-sm">
                            <CardHeader className="flex items-center justify-between px-5 pt-5 pb-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-default-500">
                                        Identity
                                    </p>
                                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                                        Download your cards
                                    </h3>
                                </div>
                                <div className="rounded-md bg-primary/10 p-2">
                                    <Icon
                                        icon="lucide:shield-check"
                                        className="h-4 w-4 text-primary"
                                    />
                                </div>
                            </CardHeader>
                            <CardBody className="px-5 pb-5 pt-2 space-y-3">
                                {/* Employee ID */}
                                <div className="flex items-center justify-between rounded-lg border border-default-200 bg-default-50 px-3 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className={`rounded-md p-1.5 ${userData.idCardPath ? 'bg-success/10' : 'bg-default-100'
                                                }`}
                                        >
                                            <Icon
                                                icon="lucide:badge-check"
                                                className={`h-4 w-4 ${userData.idCardPath
                                                    ? 'text-success'
                                                    : 'text-default-500'
                                                    }`}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                Employee ID card
                                            </p>
                                            <p className="text-xs text-default-500 truncate">
                                                {userData.empCode || 'Employee code not available'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="min-w-unit-12"
                                        isDisabled={!userData.idCardPath}
                                        isLoading={downloadingId}
                                        startContent={
                                            !downloadingId && (
                                                <Icon
                                                    icon="lucide:download"
                                                    className="h-4 w-4"
                                                />
                                            )
                                        }
                                        onPress={() =>
                                            handleDownload('ID', userData.idCardPath, userData.empCode)
                                        }
                                    >
                                        PDF
                                    </Button>
                                </div>

                                {/* ESIC card */}
                                <div className="flex items-center justify-between rounded-lg border border-default-200 bg-default-50 px-3 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className={`rounded-md p-1.5 ${userData.esicCardPath
                                                ? 'bg-success/10'
                                                : 'bg-default-100'
                                                }`}
                                        >
                                            <Icon
                                                icon="lucide:heart-pulse"
                                                className={`h-4 w-4 ${userData.esicCardPath
                                                    ? 'text-success'
                                                    : 'text-default-500'
                                                    }`}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                ESIC card
                                            </p>
                                            <p className="text-xs text-default-500 truncate">
                                                Health insurance details
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="min-w-unit-12"
                                        isDisabled={!userData.esicCardPath}
                                        isLoading={downloadingEsic}
                                        startContent={
                                            !downloadingEsic && (
                                                <Icon
                                                    icon="lucide:download"
                                                    className="h-4 w-4"
                                                />
                                            )
                                        }
                                        onPress={() =>
                                            handleDownload(
                                                'ESIC',
                                                userData.esicCardPath,
                                                userData.empCode
                                            )
                                        }
                                    >
                                        Download
                                    </Button>
                                </div>

                                {/* Offer Letter */}
                                <div className="flex items-center justify-between rounded-lg border border-default-200 bg-default-50 px-3 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className={`rounded-md p-1.5 ${offerLetterData
                                                ? 'bg-success/10'
                                                : 'bg-default-100'
                                                }`}
                                        >
                                            <Icon
                                                icon="lucide:file-text"
                                                className={`h-4 w-4 ${offerLetterData
                                                    ? 'text-success'
                                                    : 'text-default-500'
                                                    }`}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                Offer letter
                                            </p>
                                            {offerLetterData ? (
                                                <div className="text-xs text-default-500">
                                                    <p className="truncate">
                                                        Uploaded: {format(new Date(offerLetterData.uploadedAt), 'dd LLL yyyy')}
                                                    </p>
                                                    {offerLetterData.accepted && offerLetterData.acceptedAt && (
                                                        <p className="truncate">
                                                            Accepted: {format(new Date(offerLetterData.acceptedAt), 'dd LLL yyyy')}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-default-500 truncate">
                                                    Not available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="min-w-unit-12"
                                        isDisabled={!offerLetterData}
                                        isLoading={downloadingOfferLetter}
                                        startContent={
                                            !downloadingOfferLetter && (
                                                <Icon
                                                    icon="lucide:download"
                                                    className="h-4 w-4"
                                                />
                                            )
                                        }
                                        onPress={handleDownloadOfferLetter}
                                    >
                                        PDF
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Quick actions */}
                        <section>
                            <div className="mb-3 flex items-center justify-between px-1">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-default-500">
                                    Quick actions
                                </h3>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <ActionCard
                                    icon="lucide:pencil"
                                    title="Edit profile"
                                    subtitle="Update personal and contact details."
                                    onClick={() => navigate('/profile/complete')}
                                />
                                <ActionCard
                                    icon="lucide:eye"
                                    title="View full profile"
                                    subtitle="Review all your stored information."
                                    onClick={() => navigate('/profile/view')}
                                />
                                <ActionCard
                                    icon="lucide:file-text"
                                    title="My Payslips"
                                    subtitle="View and download monthly salary slips."
                                    onClick={() => navigate('/payslips')}
                                />
                                <ActionCard
                                    icon="mdi:file-document"
                                    title="Payslip Documents"
                                    subtitle="Access your uploaded payslip files."
                                    onClick={() => navigate('/payslip-documents')}
                                />
                                {/* <ActionCard
                                    icon="lucide:calendar-days"
                                    title="Leaves"
                                    subtitle="Check or request your leaves."
                                    onClick={() => {
                                        // TODO: hook this to your leave page when ready
                                    }}
                                /> */}
                                <ActionCard
                                    icon="lucide:life-buoy"
                                    title="Help & support"
                                    subtitle="Get help for profile or access issues."
                                    onClick={() => {
                                        // TODO: hook this to your help page when ready
                                    }}
                                />
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
