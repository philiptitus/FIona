import axios from 'axios';
import { AppDispatch } from '../store';
import { 
  fetchMetricsStart, 
  fetchMetricsSuccess, 
  fetchMetricsFailure,
  setCampaignSummary,
  setEmailPerformance,
  setEngagementMetrics,
  setSystemHealth,
  resetMetrics
} from '../slices/metricsSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to handle API requests
const fetchWithAuth = async (endpoint: string, token: string) => {
  const response = await axios.get(`${API_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAllMetrics = () => async (dispatch: AppDispatch, getState: any) => {
  const { auth } = getState();
  const token = auth.token;

  if (!token) return;

  try {
    dispatch(fetchMetricsStart());
    
    // Fetch all metrics in parallel
    const [
      campaignSummary, 
      emailPerformance, 
      engagementMetrics, 
      systemHealth
    ] = await Promise.all([
      fetchWithAuth('/mail/metrics/campaign-summary/', token),
      fetchWithAuth('/mail/metrics/email-performance/', token),
      fetchWithAuth('/mail/metrics/engagement/', token),
      fetchWithAuth('/mail/metrics/system-health/', token)
    ]);

    // Update state with all metrics
    dispatch(setCampaignSummary(campaignSummary));
    dispatch(setEmailPerformance(emailPerformance));
    dispatch(setEngagementMetrics(engagementMetrics));
    dispatch(setSystemHealth(systemHealth));
    
    dispatch(fetchMetricsSuccess({} as any));
  } catch (error: any) {
    dispatch(fetchMetricsFailure(error.response?.data?.detail || 'Failed to fetch metrics'));
  }
};

// Individual metric fetchers for more granular control
export const fetchCampaignSummary = () => async (dispatch: AppDispatch, getState: any) => {
  await fetchAndSetMetric(dispatch, getState, '/mail/metrics/campaign-summary/', setCampaignSummary);
};

export const fetchEmailPerformance = () => async (dispatch: AppDispatch, getState: any) => {
  await fetchAndSetMetric(dispatch, getState, '/mail/metrics/email-performance/', setEmailPerformance);
};

export const fetchEngagementMetrics = () => async (dispatch: AppDispatch, getState: any) => {
  await fetchAndSetMetric(dispatch, getState, '/mail/metrics/engagement/', setEngagementMetrics);
};

export const fetchSystemHealth = () => async (dispatch: AppDispatch, getState: any) => {
  await fetchAndSetMetric(dispatch, getState, '/mail/metrics/system-health/', setSystemHealth);
};

// Helper function for individual metric fetchers
const fetchAndSetMetric = async (
  dispatch: AppDispatch, 
  getState: any, 
  endpoint: string, 
  action: any
) => {
  const { auth } = getState();
  const token = auth.token;

  if (!token) return;

  try {
    dispatch(fetchMetricsStart());
    const data = await fetchWithAuth(endpoint, token);
    dispatch(action(data));
    dispatch(fetchMetricsSuccess({} as any));
  } catch (error: any) {
    dispatch(fetchMetricsFailure(error.response?.data?.detail || `Failed to fetch ${endpoint}`));
  }
};
