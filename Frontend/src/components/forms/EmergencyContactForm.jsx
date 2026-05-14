import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { emergencyContactSchema } from '../../schemas/userSchemas';
import { emergencyContactService } from '../../services';
import { useAuth } from '../../context/AuthContext';

/* ------------------------------ Main Component ------------------------------ */

const EmergencyContactForm = ({ onSave, onNext, onSkip, onBack, loading }) => {
    const { user } = useAuth();
    const [fetchLoading, setFetchLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(emergencyContactSchema),
        defaultValues: {
            name: '',
            relation: '',
            phoneNumber: '',

        },
    });

    // Fetch emergency contact on mount
    useEffect(() => {
        const fetchEmergencyContact = async () => {
            if (!user?.id) return;

            setFetchLoading(true);
            try {
                const response = await emergencyContactService.getMyEmergencyContact();
                if (response?.data?.success) {
                    reset(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching emergency contact:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchEmergencyContact();
    }, [user, reset]);


    const onSubmit = (data) => {
        onSave(data);
        if (onNext) onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Contact Name"
                            placeholder="Enter name"
                            errorMessage={errors.name?.message}
                            isInvalid={!!errors.name}
                            variant="bordered"
                        />
                    )}
                />

                {/* Relationship */}
                <Controller
                    name="relation"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Relationship"
                            placeholder="e.g. Father, Spouse, Friend"
                            errorMessage={errors.relationship?.message}
                            isInvalid={!!errors.relationship}
                            variant="bordered"
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
                        />
                    )}
                />
            </div>

            {/* ----------------------------- Form Actions ----------------------------- */}
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

export default EmergencyContactForm;
