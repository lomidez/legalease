import { MouseEvent } from 'react';
import { ButtonProps } from '@/types/chat';

export default function ActionButton({ label, onClick, isLoading }: ButtonProps) {
    // Handle button click event
    function handleClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!isLoading) {
            onClick(); 
        }
    }

    return (
        <div className="flex justify-center items-center">
            <button
                onClick={handleClick}
                disabled={isLoading} 
                className={`${isLoading ? 'bg-gray-400' : 'bg-blue-500'
                    } text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none`}
            >
                {label}
            </button>
        </div>
    );
}