import { apiClient } from '@/config/api-client';
import type { Supplier } from '../types/supplier.type';

export const searchSuppliers = async (search: string): Promise<Supplier[]> => {
  const { data } = await apiClient.get<Supplier[]>('/suppliers', {
    params: search ? { search } : undefined,
  });

  return data;
};
