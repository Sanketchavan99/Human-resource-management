import { Spinner } from '@heroui/react';

/**
 * LoadingSpinner Component
 * Consistent loading indicator across the application
 */
const LoadingSpinner = ({ size = 'lg', label = 'Loading...', fullScreen = false }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                <Spinner size={size} label={label} color="primary" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            <Spinner size={size} label={label} color="primary" />
        </div>
    );
};

export default LoadingSpinner;
