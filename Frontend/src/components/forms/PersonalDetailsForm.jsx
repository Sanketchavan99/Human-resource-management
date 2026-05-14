import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, SelectItem, Button, DatePicker, RadioGroup } from '@heroui/react';
import { Icon } from '@iconify/react';
import { personalDetailsSchema } from '../../schemas/userSchemas';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { CustomRadio } from '../ui/CustomRadio';

const PersonalDetailsForm = ({ onSave, onNext, loading }) => {
    const { user } = useAuth();
    const [fetchLoading, setFetchLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
        reset,
    } = useForm({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            fatherName: '',
            dob: '',
            gender: '',
            maritalStatus: '',
            education: '',
            email: '',
            phoneNumber: '',
            altPhoneNumber: '',
            designation: '',
            dateOfJoining: '',
            salary: '',
            panCardNumber: '',
            aadharNumber: '',
            drivingLicenseNumber: '',
            hasUan: '',
            uanNumber: '',
            esicNumber: '',
        },
        mode: 'onBlur',
    });

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;

            setFetchLoading(true);
            try {
                const response = await userService.getUserById(user.id);
                if (response?.data?.success) {
                    const userData = response.data.data;
                    // console.log("User Data:", userData);
                    // userData.dob = new Date(userData.dob).toISOString().split('T')[0];
                    // userData.dateOfJoining = new Date(userData.dateOfJoining).toISOString().split('T')[0];
                    // console.log("User Data after conversion:", userData);
                    userData.dob = new Date(userData.dob).toISOString().split('T')[0];
                    userData.dateOfJoining = new Date(userData.dateOfJoining).toISOString().split('T')[0];
                    console.log("User Data after conversion:", userData);
                    reset(userData);
                    // setValue('dob', userData.dob);
                    // setValue('dateOfJoining', userData.dateOfJoining);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchUserData();
    }, [user, reset]);

    const onSubmit = (data) => {
        // Ensure numeric fields are converted properly if needed
        if (data.salary) data.salary = Number(data.salary);
        onSave(data);
        if (onNext) onNext();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 w-full px-2 sm:px-4 md:px-0"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                {/* First Name */}
                <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="First Name"
                            placeholder="Enter first name"
                            errorMessage={errors.firstName?.message}
                            isInvalid={!!errors.firstName}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Last Name */}
                <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Last Name"
                            placeholder="Enter last name"
                            errorMessage={errors.lastName?.message}
                            isInvalid={!!errors.lastName}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Father Name */}
                <Controller
                    name="fatherName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Father's Name"
                            placeholder="Enter father's name"
                            errorMessage={errors.fatherName?.message}
                            isInvalid={!!errors.fatherName}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* DOB */}
                <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="date"
                            label="Date of Birth"
                            placeholder="Select date"
                            errorMessage={errors.dob?.message}
                            isInvalid={!!errors.dob}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Gender */}
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Gender"
                            placeholder="Select gender"
                            errorMessage={errors.gender?.message}
                            isInvalid={!!errors.gender}
                            variant="bordered"
                            selectedKeys={field.value ? [field.value] : []}
                            className="w-full"
                        >
                            <SelectItem key="Male">Male</SelectItem>
                            <SelectItem key="Female">Female</SelectItem>
                            <SelectItem key="Other">Other</SelectItem>
                        </Select>
                    )}
                />

                {/* Marital Status */}
                <Controller
                    name="maritalStatus"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Marital Status"
                            placeholder="Select status"
                            errorMessage={errors.maritalStatus?.message}
                            isInvalid={!!errors.maritalStatus}
                            variant="bordered"
                            selectedKeys={field.value ? [field.value] : []}
                            className="w-full"
                        >
                            <SelectItem key="Single">Single</SelectItem>
                            <SelectItem key="Married">Married</SelectItem>
                            <SelectItem key="Divorced">Divorced</SelectItem>
                            <SelectItem key="Widowed">Widowed</SelectItem>
                        </Select>
                    )}
                />

                {/* Education */}
                <Controller
                    name="education"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Education Qualification"
                            placeholder="Enter qualification"
                            errorMessage={errors.education?.message}
                            isInvalid={!!errors.education}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Designation */}
                <Controller
                    name="designation"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Designation"
                            placeholder="Enter designation"
                            errorMessage={errors.designation?.message}
                            isInvalid={!!errors.designation}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Date of Joining */}
                <Controller
                    name="dateOfJoining"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="date"
                            label="Date of Joining"
                            placeholder="Select date"
                            errorMessage={errors.dateOfJoining?.message}
                            isInvalid={!!errors.dateOfJoining}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Salary */}
                <Controller
                    name="salary"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="number"
                            label="Salary"
                            placeholder="Enter salary"
                            errorMessage={errors.salary?.message}
                            isInvalid={!!errors.salary}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Email */}
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="email"
                            label="Email Address"
                            placeholder="Enter email"
                            errorMessage={errors.email?.message}
                            isInvalid={!!errors.email}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Phone Number */}
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Phone Number"
                            placeholder="Enter phone number"
                            errorMessage={errors.phoneNumber?.message}
                            isInvalid={!!errors.phoneNumber}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Alt Phone */}
                <Controller
                    name="altPhoneNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Alternate Phone Number"
                            placeholder="Enter alternate number"
                            errorMessage={errors.altPhoneNumber?.message}
                            isInvalid={!!errors.altPhoneNumber}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* Aadhar */}
                <Controller
                    name="aadharNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Aadhar Number"
                            placeholder="Enter 12-digit Aadhar number"
                            errorMessage={errors.aadharNumber?.message}
                            isInvalid={!!errors.aadharNumber}
                            variant="bordered"
                            className="w-full"
                        />
                    )}
                />

                {/* PAN */}
                <Controller
                    name="panCardNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="PAN Card Number"
                            placeholder="Enter PAN number"
                            className="uppercase w-full"
                            errorMessage={errors.panCardNumber?.message}
                            isInvalid={!!errors.panCardNumber}
                            variant="bordered"
                        />
                    )}
                />

                {/* DL */}
                <Controller
                    name="drivingLicenseNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Driving License Number"
                            placeholder="Enter DL number"
                            className="uppercase w-full"
                            errorMessage={errors.drivingLicenseNumber?.message}
                            isInvalid={!!errors.drivingLicenseNumber}
                            variant="bordered"
                        />
                    )}
                />

                {/* ESIC (Full width on mobile) */}
                <Controller
                    name="esicNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            className="w-full sm:col-span-2"
                            label="ESIC Number"
                            placeholder="Enter ESIC number"
                            errorMessage={errors.esicNumber?.message}
                            isInvalid={!!errors.esicNumber}
                            variant="bordered"
                        />
                    )}
                />

                {/* HAS UAN */}
                <div>
                    <Controller
                        name="hasUan"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                {...field}
                                label="Do you have UAN Number?"
                                orientation="horizontal"
                                labelPlacement="outside"
                                className="w-full flex flex-wrap gap-4"
                                classNames={{ label: "text-black text-sm", }}
                            >
                                <CustomRadio key='yes' value='yes' color="success" radius="full" size="sm" activeSize="sm" activeEndContent={<Icon icon="mdi:check" />} activeColor="success" > Yes </CustomRadio> <CustomRadio key='no' value='no' color="success" radius="full" size="sm" activeSize="sm" activeEndContent={<Icon icon="mdi:check" />} activeColor="success" > No </CustomRadio>
                            </RadioGroup>
                        )}
                    />
                </div>

                {watch("hasUan") === "yes" && (
                    <Controller
                        name="uanNumber"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="UAN Number"
                                placeholder="Enter UAN number"
                                errorMessage={errors.uanNumber?.message}
                                isInvalid={!!errors.uanNumber}
                                variant="bordered"
                            />
                        )}
                    />
                )}

                {watch("hasUan") === "no" && (
                    <p className="text-sm text-gray-500 mt-2">
                        Please create UAN:{" "}
                        <a
                            className="underline text-primary"
                            href="https://unifiedportal-mem.epfindia.gov.in/memberinterface/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Click here
                        </a>
                    </p>
                )}
            </div>

            {/* BUTTON */}
            <div className="flex justify-end mt-8">
                <Button
                    color="primary"
                    type="submit"
                    isLoading={loading}
                    className="px-6 sm:px-8 w-full sm:w-auto"
                >
                    Save & Continue
                </Button>
            </div>
        </form>

    );
};

export default PersonalDetailsForm;
