import { cn } from '@/lib/utils';

export type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/** Standard padded content area for pages without the category sidebar */
export function PageContainer({ children, className }: Readonly<PageContainerProps>) {
  return (
    <div className={cn('mx-auto w-full max-w-[1584px] px-16 py-16 md:px-24', className)}>
      {children}
    </div>
  );
}
