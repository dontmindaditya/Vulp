import type { ReactNode } from "react";

interface MainContainerProps {
    children: ReactNode;
    className?: string;
}

export default function MainContainer({
    children,
    className = "",
}: MainContainerProps) {
    return (
        <div className={`app-container ${className}`}>
            {children}
        </div>
    );
}