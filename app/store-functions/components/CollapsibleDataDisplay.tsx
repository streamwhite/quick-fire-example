'use client';
import { useState } from 'react';

interface CollapsibleDataDisplayProps {
  data: unknown;
  title?: string;
  testId?: string;
  className?: string;
  defaultCollapsed?: boolean;
}

export const CollapsibleDataDisplay: React.FC<CollapsibleDataDisplayProps> = ({
  data,
  title,
  testId,
  className = 'text-green-500 mt-2 p-2 bg-gray-50 rounded overflow-auto',
  defaultCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const dataString = JSON.stringify(data, null, 2);
  const isLongData = dataString.length > 200; // Consider data "long" if over 200 characters

  return (
    <div className='mt-2'>
      {title && (
        <div className='flex items-center justify-between mb-2'>
          <h4 className='font-medium text-sm'>{title}</h4>
          {isLongData && (
            <button
              onClick={toggleCollapsed}
              className='text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700'
              title={isCollapsed ? 'Show data' : 'Hide data'}
            >
              {isCollapsed ? 'Show' : 'Hide'}
            </button>
          )}
        </div>
      )}

      {!isCollapsed || !isLongData ? (
        <pre className={className} data-testid={testId}>
          {dataString}
        </pre>
      ) : (
        <div className='p-2 bg-gray-100 rounded border text-sm text-gray-600'>
          <span className='font-mono'>{dataString.substring(0, 100)}...</span>
          <button
            onClick={toggleCollapsed}
            className='ml-2 text-blue-600 hover:text-blue-800 underline'
          >
            Show full data
          </button>
        </div>
      )}
    </div>
  );
};

export default CollapsibleDataDisplay;
