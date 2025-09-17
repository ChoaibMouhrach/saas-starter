import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  className,
}) => {
  return (
    <Card className={cn(" border rounded-md shadow-none p-0 gap-0", className)}>
      {children}
    </Card>
  );
};

interface CustomCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CustomCardHeader: React.FC<CustomCardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <CardHeader className={cn("bg-muted/60 !pb-4 p-4 border-b", className)}>
      {children}
    </CardHeader>
  );
};

interface CustomCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CustomCardTitle: React.FC<CustomCardTitleProps> = ({
  children,
  className,
}) => {
  return <CardTitle className={className}>{children}</CardTitle>;
};

interface CustomCardDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

export const CustomCardDescription: React.FC<CustomCardDescriptionProps> = ({
  children,
  className,
}) => {
  return <CardDescription className={className}>{children}</CardDescription>;
};

interface CustomCardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export const CustomCardContent: React.FC<CustomCardContentProps> = ({
  children,
  className,
}) => {
  return (
    <CardContent className={cn("grid gap-4 p-4", className)}>
      {children}
    </CardContent>
  );
};

interface CustomCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CustomCardFooter: React.FC<CustomCardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <CardFooter className={cn("border-t p-4", className)}>
      {children}
    </CardFooter>
  );
};
