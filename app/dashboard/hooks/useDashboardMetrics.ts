import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchAllMetrics } from '@/store/actions/metricsActions';

export const useDashboardMetrics = () => {
  const dispatch = useDispatch();
  const { 
    campaignSummary, 
    emailPerformance, 
    engagementMetrics, 
    systemHealth,
    loading, 
    error 
  } = useSelector((state: RootState) => state.metrics);

  useEffect(() => {
    dispatch(fetchAllMetrics());
  }, [dispatch]);

  return {
    campaignSummary,
    emailPerformance,
    engagementMetrics,
    systemHealth,
    loading,
    error
  };
};
