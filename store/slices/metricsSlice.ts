import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MetricState {
  totalCampaigns: number;
  emailsSent: number;
  openRate: number;
  clickThroughRate: number;
  loading: boolean;
  error: string | null;
}

const initialState: MetricState = {
  totalCampaigns: 0,
  emailsSent: 0,
  openRate: 0,
  clickThroughRate: 0,
  loading: false,
  error: null,
};

const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    fetchMetricsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMetricsSuccess(state, action: PayloadAction<Omit<MetricState, "loading" | "error">>) {
      state.loading = false;
      state.error = null;
      state.totalCampaigns = action.payload.totalCampaigns;
      state.emailsSent = action.payload.emailsSent;
      state.openRate = action.payload.openRate;
      state.clickThroughRate = action.payload.clickThroughRate;
    },
    fetchMetricsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchMetricsStart, fetchMetricsSuccess, fetchMetricsFailure } = metricsSlice.actions;
export default metricsSlice.reducer;
