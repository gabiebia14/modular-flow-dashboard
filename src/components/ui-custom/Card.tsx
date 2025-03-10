
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  glassmorphism?: boolean;
  hover?: boolean;
}

export const Card = ({ 
  children, 
  className, 
  glassmorphism = false, 
  hover = false 
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-subtle transition-all duration-300", 
        glassmorphism && "card-glass",
        hover && "hover:shadow-hover hover:translate-y-[-2px]",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("mb-2", className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={cn("text-lg font-semibold", className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
};

export const CardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("mt-4 flex items-center", className)}>
      {children}
    </div>
  );
};
