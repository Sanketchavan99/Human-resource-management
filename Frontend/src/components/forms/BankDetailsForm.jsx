import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { bankDetailsSchema } from '../../schemas/userSchemas';
import { bankDetailService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const BankDetailsForm = ({ onSave, onNext, onSkip, onBack, loading }) => {
    const { user } = useAuth();
    const [fetchLoading, setFetchLoading] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(bankDetailsSchema),
        defaultValues: {
            accountNumber: '',
            confirmAccountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: '',
            accountHolderName: '',
            accountType: '',
        },
    });

    // Fetch bank details on mount
    useEffect(() => {
        const fetchBankDetails = async () => {
            if (!user?.id) return;

            setFetchLoading(true);
            try {
                const response = await bankDetailService.getMyBankDetail();
                if (response?.data?.success && response.data.data) {
                    reset(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching bank details:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchBankDetails();
    }, [user, reset]);

    const onSubmit = (data) => {
        onSave(data);
        if (onNext) onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Holder Name */}
                <Controller
                    name="accountHolderName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Account Holder Name"
                            placeholder="Enter name as per bank records"
                            errorMessage={errors.accountHolderName?.message}
                            isInvalid={!!errors.accountHolderName}
                            variant="bordered"
                            isRequired
                        />
                    )}
                />

                {/* Account Type */}
                <Controller
                    name="accountType"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Account Type"
                            placeholder="Select account type"
                            errorMessage={errors.accountType?.message}
                            isInvalid={!!errors.accountType}
                            variant="bordered"
                            selectedKeys={field.value ? [field.value] : []}
                            isRequired
                        >
                            <SelectItem key="Savings" value="Savings">Savings Account</SelectItem>
                            <SelectItem key="Current" value="Current">Current Account</SelectItem>
                        </Select>
                    )}
                />

                {/* Account Number */}
                <Controller
                    name="accountNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Account Number"
                            placeholder="Enter account number"
                            errorMessage={errors.accountNumber?.message}
                            isInvalid={!!errors.accountNumber}
                            variant="bordered"
                            isRequired
                        />
                    )}
                />

                {/* Confirm Account Number */}
                <Controller
                    name="confirmAccountNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Confirm Account Number"
                            placeholder="Re-enter account number"
                            errorMessage={errors.confirmAccountNumber?.message}
                            isInvalid={!!errors.confirmAccountNumber}
                            variant="bordered"
                            isRequired
                        />
                    )}
                />

                {/* IFSC Code */}
                <Controller
                    name="ifscCode"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="IFSC Code"
                            placeholder="Enter IFSC code"
                            errorMessage={errors.ifscCode?.message}
                            isInvalid={!!errors.ifscCode}
                            variant="bordered"
                            className="uppercase"
                            maxLength={11}
                            isRequired
                        />
                    )}
                />

                {/* Bank Name */}
                <Controller
                    name="bankName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Bank Name"
                            placeholder="Enter bank name"
                            errorMessage={errors.bankName?.message}
                            isInvalid={!!errors.bankName}
                            variant="bordered"
                            isRequired
                        />
                    )}
                />

                {/* Branch Name */}
                <Controller
                    name="branchName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Branch Name"
                            placeholder="Enter branch name (Optional)"
                            errorMessage={errors.branchName?.message}
                            isInvalid={!!errors.branchName}
                            variant="bordered"
                        />
                    )}
                />
            </div>

            <div className="flex flex-col gap-3 mt-6 sm:mt-8 sm:flex-row sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    isDisabled={loading}
                    startContent={<Icon icon="lucide:arrow-left" className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                >
                    Back
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant="flat"
                        size="sm"
                        onClick={onSkip}
                        isDisabled={loading}
                        className="flex-1 sm:flex-none"
                    >
                        Skip
                    </Button>
                    <Button
                        color="primary"
                        size="sm"
                        type="submit"
                        isLoading={loading}
                        endContent={!loading && <Icon icon="lucide:arrow-right" className="h-4 w-4" />}
                        className="flex-1 sm:flex-none"
                    >
                        Save & Continue
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default BankDetailsForm;
