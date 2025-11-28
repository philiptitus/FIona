import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import {
  fetchDashboardMetricsStart,
  fetchDashboardMetricsSuccess,
  fetchDashboardMetricsFailure,
  type DashboardMetrics
} from "../slices/analyticsSlice";
import api from "@/lib/api";

export const fetchDashboardMetrics = createAsyncThunk<
  any,
  void,
  {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: string;
  }
>(
  "analytics/fetchDashboardMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/metrics/dashboard/");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch dashboard metrics"
      );
    }
  }
);

// Thunk action handler
export const handleFetchDashboardMetrics = () => async (
  dispatch: AppDispatch
) => {
  try {
    dispatch(fetchDashboardMetricsStart());
    const result = await dispatch(fetchDashboardMetrics());
    
    if (fetchDashboardMetrics.fulfilled.match(result)) {
      dispatch(fetchDashboardMetricsSuccess(result.payload));
      return result.payload;
    } else {
      dispatch(
        fetchDashboardMetricsFailure(
          result.payload || "Failed to fetch dashboard metrics"
        )
      );
      throw new Error(result.payload || "Failed to fetch dashboard metrics");
    }
  } catch (error: any) {
    dispatch(fetchDashboardMetricsFailure(error.message || "Failed to fetch dashboard metrics"));
    throw error;
  }
};
