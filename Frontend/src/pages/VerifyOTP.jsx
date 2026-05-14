import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputOtp, Button, Card, CardBody, CardHeader, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { otpSchema } from '../schemas/authSchemas';
import authService from '../services/authService';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const empCode = location.state?.empCode;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    useEffect(() => {
        if (!empCode) {
            navigate('/login');
        }
    }, [empCode, navigate]);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const response = await verifyOtp(empCode, data.otp);

            if (response.success) {
                const user = response.user;
                // Check if user has password set
                if (false) {
                    navigate('/create-password');
                } else {
                    // Redirect based on role (case-insensitive)
                    const userRole = (user.role || '').toLowerCase();
                    if (userRole === 'admin') {
                        navigate('/admin');
                    } else if (userRole === 'employer') {
                        navigate('/company/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }
            } else {
                setError(response.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        try {
            setLoading(true);
            const response = await authService.resendOTP({ empCode });
            if (response.data?.success) {
                setResendTimer(30);
                setError('');
            } else {
                setError(response.data?.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-default-50 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <Icon icon="lucide:smartphone" width="32" height="32" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Verify OTP</h1>
                    <p className="text-default-500 text-center">
                        Enter the 6-digit code sent to your registered mobile number
                    </p>
                </CardHeader>

                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 items-center">
                        <div className="flex flex-col items-center gap-2 w-full">
                            <Controller
                                name="otp"
                                control={control}
                                render={({ field }) => (
                                    <InputOtp
                                        {...field}
                                        length={6}
                                        variant="bordered"
                                        color="primary"
                                        size="lg"
                                        errorMessage={errors.otp?.message}
                                        isInvalid={!!errors.otp}
                                        classNames={{
                                            segmentWrapper: "gap-2",
                                        }}
                                    />
                                )}
                            />
                            {errors.otp && (
                                <p className="text-danger text-xs">{errors.otp.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="w-full p-3 rounded-lg bg-danger/10 text-danger text-sm flex items-center gap-2 justify-center">
                                <Icon icon="lucide:alert-circle" width="16" height="16" />
                                {error}
                            </div>
                        )}

                        <Button
                            color="primary"
                            type="submit"
                            size="lg"
                            className="w-full font-semibold"
                            isLoading={loading}
                        >
                            Verify & Proceed
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-default-500">Didn't receive code? </span>
                            {resendTimer > 0 ? (
                                <span className="text-default-400">Resend in {resendTimer}s</span>
                            ) : (
                                <Link
                                    as="button"
                                    color="primary"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={handleResendOTP}
                                >
                                    Resend OTP
                                </Link>
                            )}
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default VerifyOTP;
