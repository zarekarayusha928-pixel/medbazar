import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/services/api/client';

export interface UseApiQueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError | Error) => void;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
  isEmpty: boolean;
  refetch: () => Promise<T | null>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Clean Server State Hook for Read operations
 * Separates server data fetching lifecycle from UI presentation state
 */
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const { enabled = true, initialData = null, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFnRef.current();
      setData(result);
      onSuccessRef.current?.(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof ApiError ? err : new Error(err?.message || 'Failed to load data');
      setError(errorObj);
      onErrorRef.current?.(errorObj);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, execute, ...deps]);

  const isEmpty =
    !loading &&
    !error &&
    (data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'object' && Object.keys(data).length === 0));

  return {
    data,
    loading,
    error,
    isEmpty,
    refetch: execute,
    setData,
  };
}

export interface UseApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: ApiError | Error | null;
  data: TData | null;
  reset: () => void;
}

/**
 * Clean Server State Hook for Mutation operations (Create, Update, Delete)
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError | Error, variables: TVariables) => void;
  } = {}
): UseApiMutationResult<TData, TVariables> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        options.onSuccess?.(result, variables);
        return result;
      } catch (err: any) {
        const errorObj = err instanceof ApiError ? err : new Error(err?.message || 'Operation failed');
        setError(errorObj);
        options.onError?.(errorObj, variables);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutationFn]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}
