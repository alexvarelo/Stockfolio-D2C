import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PortfolioLayoutProps = {
  children: ReactNode;
  className?: string;
};

export const PortfolioLayout = ({ children, className = "" }: PortfolioLayoutProps) => {
  return (
    <div className={`container mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4 ${className}`}>
      {children}
    </div>
  );
};

type PortfolioGridProps = {
  children: ReactNode;
  className?: string;
};

export const PortfolioGrid = ({ children}: PortfolioGridProps) => {
  return <div className="lg:grid lg:grid-cols-4 gap-4">{children}</div>;
};

type PortfolioMainContentProps = {
  children: ReactNode;
  className?: string;
};

export const PortfolioMainContent = ({ children  }: PortfolioMainContentProps) => {
  return <div className="lg:col-span-3">{children}</div>;
};

type PortfolioSidebarProps = {
  children: ReactNode;
  className?: string;
};

export const PortfolioSidebar = ({ children}: PortfolioSidebarProps) => {
  return <div className="mt-4 lg:mt-0">{children}</div>;
};

type PortfolioSectionProps = {
  children: ReactNode;
  className?: string;
};

export const PortfolioSection = ({ children, className = "" }: PortfolioSectionProps) => {
  return <div className={`space-y-3 sm:space-y-4 ${className}`}>{children}</div>;
};

export const PortfolioLoadingSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <Skeleton className="h-10 w-24" />

    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
