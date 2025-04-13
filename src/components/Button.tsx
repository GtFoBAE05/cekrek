import { ReactNode } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "py-2 px-4",
    {
        variants: {
            variant: {
                primary: 'cursor-pointer bg-red-400 text-white hover:bg-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-600 hover:scale-105 transition duration-300 disabled:bg-red-300 disabled:text-white disabled:cursor-not-allowed disabled:opacity-60',
                outline: 'cursor-pointer border border-red-400 bg-white text-red-500 hover:bg-red-100 hover:text-red-600 dark:border-red-500 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900 hover:scale-105 transition duration-300 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed disabled:opacity-50',
            },
        },
        defaultVariants: {
            variant: "primary",
        },
    }
);

interface CustomButtonProps extends VariantProps<typeof buttonVariants> {
    children: ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    disabled ?: boolean
}

export default function Button({
                                   children,
                                   variant,
                                   onClick,
                                   className,
                                   disabled,
                               }: CustomButtonProps) {
    return (
        <ShadcnButton
            className={cn(buttonVariants({ variant }), className)}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </ShadcnButton>
    );
}
