import { apiClient } from '@/config/api-client';
import type {
  CreateDisbursementRequestPayload,
  CreateDisbursementRequestResponse,
  DecideDisbursementRequestPayload,
  DecisionResponse,
  DisbursementRequestSummary,
  ListDisbursementRequestsParams,
  ListDisbursementRequestsResponse,
} from '../types/disbursement-request.type';

export const listDisbursementRequests = async (
  params: ListDisbursementRequestsParams,
): Promise<ListDisbursementRequestsResponse> => {
  const { data } = await apiClient.get<ListDisbursementRequestsResponse>(
    '/disbursement-requests',
    { params },
  );

  return data;
};

export const getDisbursementRequest = async (
  id: string,
): Promise<DisbursementRequestSummary> => {
  const { data } = await apiClient.get<DisbursementRequestSummary>(
    `/disbursement-requests/${id}`,
  );

  return data;
};

export const createDisbursementRequest = async (
  payload: CreateDisbursementRequestPayload,
): Promise<CreateDisbursementRequestResponse> => {
  const { data } = await apiClient.post<CreateDisbursementRequestResponse>(
    '/disbursement-requests',
    payload,
  );

  return data;
};

export const decideDisbursementRequest = async (
  id: string,
  payload: DecideDisbursementRequestPayload,
): Promise<DecisionResponse> => {
  const { data } = await apiClient.post<DecisionResponse>(
    `/disbursement-requests/${id}/decision`,
    payload,
  );

  return data;
};
