import { FieldError } from 'react-hook-form';

export const formInputClass = (error?: FieldError) =>
    `
    honor-input pl-10
    rounded-[6px]
    border-[#e5e7eb]
    focus-visible:ring-offset-0
    focus-visible:ring-1
    text-[14px]
    ${
        error
            ? 'border border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500'
            : 'focus-visible:ring-honor-gray focus-visible:border-honor-gray'
    }
  `;

export const FormError = ({ error }: { error?: FieldError }) => {
    if (!error) return null;

    return <p className="absolute text-sm text-red-500 text-xs">{error.message}</p>;
};
