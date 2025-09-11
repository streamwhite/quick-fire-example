'use client';
import {
  collection,
  createQuery,
  getAverageForQuery,
  getCountForQuery,
  getSumForQuery,
} from 'quick-fire-store';
import { useState } from 'react';
import { CONSTANTS } from '../utils';
import { BaseComponentProps } from './types';

const TEST_COLLECTION = CONSTANTS.get('TEST_COLLECTION');

export const AggregateOperations: React.FC<BaseComponentProps> = ({
  db,
  setError,
  setLoading,
}) => {
  const [qty, setQty] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(null);

  return (
    <div className='mb-8 border rounded-lg p-4 bg-gray-50'>
      <h2 className='text-xl font-semibold mb-4'>Aggregate Operations</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Sum Query */}
        <div className='border rounded p-4 bg-white'>
          <button
            className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            data-testid='get-sum'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);

                // Get sum using aggregate query
                const query = createQuery({
                  collectionRef: collection(db, TEST_COLLECTION),
                });
                const result = await getSumForQuery({
                  query,
                  field: 'qty',
                });
                setQty(result);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Calculate Sum of &apos;qty&apos; Field
          </button>
          {qty !== null && (
            <div className='mt-2 text-center'>
              <span className='font-semibold'>Result: </span>
              <span className='text-green-500' data-testid='sum-result'>
                {qty}
              </span>
            </div>
          )}
        </div>

        {/* Count Query */}
        <div className='border rounded p-4 bg-white'>
          <button
            className='w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
            data-testid='get-count'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const query = createQuery({
                  collectionRef: collection(db, TEST_COLLECTION),
                });
                const count = await getCountForQuery({ query });
                setCount(count);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Count All Documents
          </button>
          {count !== null && (
            <div className='mt-2 text-center'>
              <span className='font-semibold'>Result: </span>
              <span className='text-green-500' data-testid='count-result'>
                {count}
              </span>
            </div>
          )}
        </div>

        {/* Average Query */}
        <div className='border rounded p-4 bg-white'>
          <button
            className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
            data-testid='get-average'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const query = createQuery({
                  collectionRef: collection(db, TEST_COLLECTION),
                });
                const average = await getAverageForQuery({
                  query,
                  field: 'qty',
                });
                setAverage(average);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Calculate Average of &apos;qty&apos; Field
          </button>
          {average !== null && (
            <div className='mt-2 text-center'>
              <span className='font-semibold'>Result: </span>
              <span className='text-green-500' data-testid='average-result'>
                {average}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AggregateOperations;
