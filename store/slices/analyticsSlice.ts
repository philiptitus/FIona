import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WeeklyData {
  [date: string]: number;
}

interface IndustryData {
  [industry: string]: number;
}

interface PendingToday {
  scheduled: number;
  sequence: number;
  total: number;
}

interface DashboardMetrics {
  total_sent: number;
  total_campaigns: number;
  total_contacts: number;
  weekly_window: WeeklyData;
  pending_today: PendingToday;
  by_industry: IndustryData;
}

interface AnalyticsState {
  dashboardMetrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: AnalyticsState = {
  dashboardMetrics: null,
  loading: false,
  error: null,
  lastUpdated: null
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    fetchDashboardMetricsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardMetricsSuccess(state, action: PayloadAction<DashboardMetrics>) {
      state.dashboardMetrics = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    fetchDashboardMetricsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetAnalytics(state) {
      return { ...initialState };
    }
  },
});

export const {
  fetchDashboardMetricsStart,
  fetchDashboardMetricsSuccess,
  fetchDashboardMetricsFailure,
  resetAnalytics
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
