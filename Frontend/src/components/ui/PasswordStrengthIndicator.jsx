import { Progress } from '@heroui/react';
import { getPasswordStrength } from '../../schemas/authSchemas';

/**
 * PasswordStrengthIndicator Component
 * Visual indicator for password strength
 */
const PasswordStrengthIndicator = ({ password }) => {
    const { strength, label, color } = getPasswordStrength(password);

    if (!password) return null;

    const value = (strength / 4) * 100;

    return (
        <div className="space-y-2 mt-2">
            <Progress
                value={value}
                color={color}
                size="sm"
                className="max-w-full"
                aria-label="Password strength"
            />
            <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Password Strength:</span>
                <span className={`text-sm font-medium text-${color}`}>{label}</span>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
