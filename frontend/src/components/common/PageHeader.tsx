import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6'>
      <div>
        <h1 className='text-2xl font-black text-slate-950 tracking-tight mb-2'>
          {title}
        </h1>
        {subtitle && (
          <p className='text-sm font-medium text-slate-600'>
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
