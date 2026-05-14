import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Checkbox, Card, CardBody, CardHeader } from '@heroui/react';
import { Icon } from '@iconify/react';
import { addressService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { z } from 'zod';

// Define schema locally since we are changing the structure
const addressSchema = z.object({
    permanent: z.object({
        addressLine: z.string().min(1, "Address line is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().length(6, "PIN Code must be 6 digits").regex(/^\d+$/, "Must be numbers only"),
        country: z.string().default("India"),
    }),
    current: z.object({
        addressLine: z.string().min(1, "Address line is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().length(6, "PIN Code must be 6 digits").regex(/^\d+$/, "Must be numbers only"),
        country: z.string().default("India"),
    }),
});

/* ------------------------------ Main Component ------------------------------ */

const AddressForm = ({ onSkip, onBack, loading: parentLoading }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sameAsPermanent, setSameAsPermanent] = useState(false);
    const [existingAddresses, setExistingAddresses] = useState({ current: null, permanent: null });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            permanent: { addressLine: '', city: '', state: '', pincode: '', country: 'India' },
            current: { addressLine: '', city: '', state: '', pincode: '', country: 'India' },
        },
    });

    const permanentValues = watch('permanent');

    // Fetch addresses on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const response = await addressService.getMyAddresses();
                if (response?.data?.success) {
                    const addresses = response.data.data || [];
                    const current = addresses.find(a => a.type === 'Current');
                    const permanent = addresses.find(a => a.type === 'Permanent');

                    setExistingAddresses({ current, permanent });

                    if (permanent) {
                        setValue('permanent', {
                            addressLine: permanent.addressLine,
                            city: permanent.city,
                            state: permanent.state,
                            pincode: permanent.pincode,
                            country: permanent.country || 'India',
                        });
                    }
                    if (current) {
                        setValue('current', {
                            addressLine: current.addressLine,
                            city: current.city,
                            state: current.state,
                            pincode: current.pincode,
                            country: current.country || 'India',
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, [user, setValue]);

    // Handle "Same as Permanent" checkbox
    useEffect(() => {
        if (sameAsPermanent) {
            setValue('current', permanentValues);
        }
    }, [sameAsPermanent, permanentValues, setValue]);

    const onSubmit = async (data) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Save Permanent Address
            const permanentData = { ...data.permanent, type: 'Permanent', userId: user.id };
            if (existingAddresses.permanent) {
                await addressService.updateAddress(existingAddresses.permanent.id, permanentData);
            } else {
                await addressService.createAddress(permanentData);
            }

            // Save Current Address
            const currentData = { ...data.current, type: 'Current', userId: user.id };
            if (existingAddresses.current) {
                await addressService.updateAddress(existingAddresses.current.id, currentData);
            } else {
                await addressService.createAddress(currentData);
            }

            if (onSkip) onSkip(); // Proceed to next step
        } catch (error) {
            console.error('Error saving addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderAddressFields = (type, labelPrefix) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <Controller
                    name={`${type}.addressLine`}
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Address Line"
                            placeholder="House No, Street, Area"
                            errorMessage={errors[type]?.addressLine?.message}
                            isInvalid={!!errors[type]?.addressLine}
                            variant="bordered"
                            isRequired
                        />
                    )}
                />
            </div>
            <Controller
                name={`${type}.city`}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label="City"
                        placeholder="Enter city"
                        errorMessage={errors[type]?.city?.message}
                        isInvalid={!!errors[type]?.city}
                        variant="bordered"
                        isRequired
                    />
                )}
            />
            <Controller
                name={`${type}.state`}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label="State"
                        placeholder="Enter state"
                        errorMessage={errors[type]?.state?.message}
                        isInvalid={!!errors[type]?.state}
                        variant="bordered"
                        isRequired
                    />
                )}
            />
            <Controller
                name={`${type}.pincode`}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label="PIN Code"
                        placeholder="Enter 6-digit PIN"
                        errorMessage={errors[type]?.pincode?.message}
                        isInvalid={!!errors[type]?.pincode}
                        variant="bordered"
                        maxLength={6}
                        isRequired
                    />
                )}
            />
            <Controller
                name={`${type}.country`}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        label="Country"
                        placeholder="Enter country"
                        errorMessage={errors[type]?.country?.message}
                        isInvalid={!!errors[type]?.country}
                        variant="bordered"
                        isReadOnly
                    />
                )}
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ----------------------- Permanent Address Section ----------------------- */}
            <Card className="border border-default-200 shadow-sm">
                <CardHeader className="px-5 pt-5 pb-3 flex items-center gap-3">
                    <div className="rounded-md bg-default-100 p-1.5">
                        <Icon icon="lucide:home" className="h-4 w-4 text-default-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Permanent Address</h3>
                </CardHeader>
                <CardBody className="px-5 py-4">
                    {renderAddressFields('permanent', 'Permanent')}
                </CardBody>
            </Card>

            {/* ----------------------- Address Copy Checkbox ----------------------- */}
            <div className="flex items-center gap-2 px-1">
                <Checkbox
                    isSelected={sameAsPermanent}
                    onValueChange={setSameAsPermanent}
                >
                    Current Address is same as Permanent Address
                </Checkbox>
            </div>

            {/* ----------------------- Current Address Section ----------------------- */}
            <Card className="border border-default-200 shadow-sm">
                <CardHeader className="px-5 pt-5 pb-3 flex items-center gap-3">
                    <div className="rounded-md bg-default-100 p-1.5">
                        <Icon icon="lucide:map-pin" className="h-4 w-4 text-default-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Current Address</h3>
                </CardHeader>
                <CardBody className="px-5 py-4">
                    {renderAddressFields('current', 'Current')}
                </CardBody>
            </Card>

            {/* ----------------------------- Form Actions ----------------------------- */}
            <div className="flex justify-between gap-4 mt-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    isDisabled={loading || parentLoading}
                    startContent={<Icon icon="lucide:arrow-left" className="h-4 w-4" />}
                >
                    Back
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    type="submit"
                    isLoading={loading || parentLoading}
                    endContent={!(loading || parentLoading) && <Icon icon="lucide:arrow-right" className="h-4 w-4" />}
                >
                    Save & Continue
                </Button>
            </div>
        </form>
    );
};

export default AddressForm;
