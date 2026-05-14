import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button, Avatar, Divider, Spinner, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';

const ProfileView = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

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
        fetchProfileData();
    }, [user]);

    const SectionHeader = ({ title, icon }) => (
        <div className="flex items-center gap-2 mb-4 text-primary">
            <Icon icon={icon} width="20" height="20" />
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
    );

    const InfoItem = ({ label, value }) => (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-default-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium">{value || 'N/A'}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-default-50">
                <Spinner size="lg" />
            </div>
        );
    }

    const userData = profileData?.user || {};
    const addresses = userData.addresses || [];
    const bankDetail = userData.bankDetail;
    const emergencyContact = userData.emergencyContact;
    const familyMembers = userData.familyMembers || [];
    const nominees = userData.nominees || [];
    const documents = profileData?.documents || [];
    const profileCompletion = profileData?.profileCompletion?.totalPercentage || 0;

    return (
        <div className="min-h-screen bg-default-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* ------------------------------ Page Header ------------------------------ */}
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-foreground leading-tight sm:text-xl">
                                My Profile
                            </h1>
                            <p className="text-xs text-default-500 mt-1 sm:text-sm">
                                View and manage your personal information
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                color="primary"
                                variant="ghost"
                                size="sm"
                                startContent={<Icon icon="lucide:edit-3" className="h-4 w-4" />}
                                onPress={() => navigate('/profile/complete')}
                                className="w-full sm:w-auto"
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Top Section: Basic Info and Personal Details Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Left: Basic Info */}
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardBody className="flex flex-col items-center text-center p-6">
                                <div className="relative group mb-4">
                                    <Avatar
                                        src={`${import.meta.env.VITE_API_URL}/${userData.avatarUrl}`}
                                        name={userData.firstName || userData.name}
                                        className="w-24 h-24 text-large"
                                        isBordered
                                        color="primary"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <label htmlFor="avatar-upload" className="cursor-pointer">
                                            <Icon icon="lucide:camera" className="text-white text-2xl" />
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file && user?.id) {
                                                    try {
                                                        const response = await userService.uploadAvatar(user.id, file);
                                                        if (response?.data?.success) {
                                                            const user = localStorage.getItem('user');
                                                            const parsedUser = JSON.parse(user);
                                                            parsedUser.avatarUrl = response.data.data.avatarUrl;
                                                            localStorage.setItem('user', JSON.stringify(parsedUser));
                                                            setUser(parsedUser);
                                                            // Refresh profile data
                                                            const profileResponse = await userService.getMyCompleteProfile();
                                                            if (profileResponse?.data?.success) {
                                                                setProfileData(profileResponse.data.data);
                                                            }
                                                        }
                                                    } catch (error) {
                                                        console.error('Error uploading avatar:', error);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    {userData.avatarUrl && (
                                        <button
                                            onClick={async () => {
                                                if (user?.id) {
                                                    try {
                                                        const response = await userService.deleteAvatar(user.id);
                                                        if (response?.data?.success) {
                                                            // Refresh profile data
                                                            const profileResponse = await userService.getMyCompleteProfile();
                                                            if (profileResponse?.data?.success) {
                                                                setProfileData(profileResponse.data.data);
                                                            }
                                                        }
                                                    } catch (error) {
                                                        console.error('Error deleting avatar:', error);
                                                    }
                                                }
                                            }}
                                            className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-danger text-white hover:bg-danger-600 transition-colors"
                                        >
                                            <Icon icon="lucide:trash-2" className="text-sm" />
                                        </button>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold">
                                    {userData.firstName && userData.lastName
                                        ? `${userData.firstName} ${userData.lastName}`
                                        : userData.name || 'Employee Name'}
                                </h2>
                                <p className="text-default-500">{userData.designation || 'Designation'}</p>
                                <div className="mt-4 flex gap-2 flex-wrap justify-center">
                                    <Chip size="sm" variant="flat" color="primary">
                                        {userData.empCode || 'EMP000'}
                                    </Chip>
                                    <Chip size="sm" variant="flat" color="success">Active</Chip>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm">
                            <CardBody className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-default-100">
                                        <Icon icon="lucide:mail" className="text-default-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-default-500">Email</p>
                                        <p className="text-sm font-medium">{userData.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-default-100">
                                        <Icon icon="lucide:phone" className="text-default-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-default-500">Phone</p>
                                        <p className="text-sm font-medium">{userData.phoneNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-default-100">
                                        <Icon icon="lucide:calendar" className="text-default-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-default-500">Date of Joining</p>
                                        <p className="text-sm font-medium">
                                            {userData.dateOfJoining
                                                ? new Date(userData.dateOfJoining).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right: Personal Details */}
                    <div className="md:col-span-2">
                        <Card className="shadow-sm h-full">
                            <CardBody className="p-6">
                                <SectionHeader title="Personal Details" icon="lucide:user" />
                                <div className="grid grid-cols-2 gap-6">
                                    <InfoItem label="First Name" value={userData.firstName} />
                                    <InfoItem label="Last Name" value={userData.lastName} />
                                    <InfoItem label="Father's Name" value={userData.fatherName} />
                                    <InfoItem
                                        label="Date of Birth"
                                        value={userData.dob ? new Date(userData.dob).toLocaleDateString() : 'N/A'}
                                    />
                                    <InfoItem label="Gender" value={userData.gender} />
                                    <InfoItem label="Marital Status" value={userData.maritalStatus} />
                                    <InfoItem label="Education" value={userData.education} />
                                    <InfoItem label="Designation" value={userData.designation} />
                                    <InfoItem
                                        label="Salary"
                                        value={userData.salary ? `₹${Number(userData.salary).toLocaleString('en-IN')}` : 'N/A'}
                                    />
                                    <InfoItem label="PAN Number" value={userData.panCardNumber} />
                                    <InfoItem label="Aadhar Number" value={userData.aadharNumber} />
                                    <InfoItem label="Driving License" value={userData.drivingLicenseNumber} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Bottom Sections: Full Width */}
                <div className="space-y-6">
                    {/* Addresses */}
                    <Card className="shadow-sm">
                        <CardBody className="p-6">
                            <SectionHeader title="Addresses" icon="lucide:map-pin" />
                            {addresses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-default-50 border border-default-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <Chip size="sm" variant="solid" color="primary">
                                                    {address.type}
                                                </Chip>
                                            </div>
                                            <p className="text-sm text-[hsl(var(--primary))]">
                                                {address.addressLine && <>{address.addressLine}<br /></>}
                                                {address.city && <>{address.city}, </>}
                                                {address.state && <>{address.state}</>}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-default-500">No addresses added yet</p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Bank Details */}
                    {bankDetail && (
                        <Card className="shadow-sm">
                            <CardBody className="p-6">
                                <SectionHeader title="Bank Details" icon="lucide:credit-card" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <InfoItem label="Bank Name" value={bankDetail.bankName} />
                                    <InfoItem label="Account Holder" value={bankDetail.accountHolderName} />
                                    <InfoItem
                                        label="Account Number"
                                        value={bankDetail.accountNumber ? `**** **** ${bankDetail.accountNumber.slice(-4)}` : 'N/A'}
                                    />
                                    <InfoItem label="IFSC Code" value={bankDetail.ifscCode} />
                                    <InfoItem label="Account Type" value={bankDetail.accountType} />
                                    <InfoItem label="Branch" value={bankDetail.branchName} />
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Emergency Contact */}
                    {emergencyContact && (
                        <Card className="shadow-sm">
                            <CardBody className="p-6">
                                <SectionHeader title="Emergency Contact" icon="lucide:phone-call" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <InfoItem label="Name" value={emergencyContact.name} />
                                    <InfoItem label="Relationship" value={emergencyContact.relation} />
                                    <InfoItem label="Phone Number" value={emergencyContact.phoneNumber} />
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Family Members */}
                    {familyMembers.length > 0 && (
                        <Card className="shadow-sm">
                            <CardBody className="p-6">
                                <SectionHeader title="Family Members" icon="lucide:users" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {familyMembers.map((member, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-default-50 border border-default-100">
                                            <div className="grid grid-cols-2 gap-4">
                                                <InfoItem label="Name" value={member.name} />
                                                <InfoItem label="Relationship" value={member.relation} />
                                                <InfoItem
                                                    label="Date of Birth"
                                                    value={member.dob ? new Date(member.dob).toLocaleDateString() : 'N/A'}
                                                />
                                                <InfoItem label="Phone" value={member.phoneNumber} />
                                                {member.occupation && <InfoItem label="Occupation" value={member.occupation} />}
                                                {member.isDependent !== undefined && (
                                                    <div className="col-span-2">
                                                        <Chip size="sm" variant="flat" color={member.isDependent ? "warning" : "default"}>
                                                            {member.isDependent ? "Dependent" : "Non-Dependent"}
                                                        </Chip>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Nominees */}
                    {nominees.length > 0 && (
                        <Card className="shadow-sm">
                            <CardBody className="p-6">
                                <SectionHeader title="Nominees" icon="lucide:user-check" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {nominees.map((nominee, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-default-50 border border-default-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-semibold">{nominee.name}</h4>
                                                <Chip size="sm" variant="flat" color="success">
                                                    {nominee.sharePercentage}% Share
                                                </Chip>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InfoItem label="Relationship" value={nominee.relation} />
                                                <InfoItem
                                                    label="Date of Birth"
                                                    value={nominee.dob ? new Date(nominee.dob).toLocaleDateString() : 'N/A'}
                                                />
                                                <InfoItem label="Phone" value={nominee.phoneNumber} />
                                                <InfoItem label="City" value={nominee.city} />
                                            </div>
                                            {nominee.address && (
                                                <div className="mt-3">
                                                    <InfoItem label="Address" value={nominee.address} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Documents */}
                    {documents.length > 0 && (
                        <Card className="shadow-sm">
                            <CardBody className="p-6">
                                <SectionHeader title="Uploaded Documents" icon="lucide:file-text" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-default-50 border border-default-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Icon icon="mdi:file-document" className="text-2xl text-primary" />
                                                <div>
                                                    <p className="font-semibold text-sm capitalize">
                                                        {doc.type.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-xs text-default-500 truncate max-w-[150px]">{doc.filename}</p>
                                                </div>
                                            </div>
                                            <Chip size="sm" variant="flat" color="success">
                                                <Icon icon="lucide:check" className="text-xs" />
                                            </Chip>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
