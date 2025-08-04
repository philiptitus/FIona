import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CampaignSummary {
  total_campaigns: number;
  active_campaigns: number;
  avg_emails_per_campaign: number;
}

interface EmailPerformance {
  total_emails: number;
  recent_emails: number;
  reach_percentage: number;
}

interface EngagementMetrics {
  total_contacts: number;
  contacted_contacts: number;
  unique_organizations: number;
}

interface SystemHealth {
  connected_mailboxes: number;
  email_templates: number;
  email_contents: number;
}

interface MetricsState {
  campaignSummary: CampaignSummary | null;
  emailPerformance: EmailPerformance | null;
  engagementMetrics: EngagementMetrics | null;
  systemHealth: SystemHealth | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: MetricsState = {
  campaignSummary: null,
  emailPerformance: null,
  engagementMetrics: null,
  systemHealth: null,
  loading: false,
  error: null,
  lastUpdated: null
};

const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    fetchMetricsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMetricsSuccess(state) {
      state.loading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    fetchMetricsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCampaignSummary(state, action: PayloadAction<CampaignSummary>) {
      state.campaignSummary = action.payload;
    },
    setEmailPerformance(state, action: PayloadAction<EmailPerformance>) {
      state.emailPerformance = action.payload;
    },
    setEngagementMetrics(state, action: PayloadAction<EngagementMetrics>) {
      state.engagementMetrics = action.payload;
    },
    setSystemHealth(state, action: PayloadAction<SystemHealth>) {
      state.systemHealth = action.payload;
    },
    resetMetrics(state) {
      return { ...initialState };
    }
  },
});

export const {
  fetchMetricsStart,
  fetchMetricsSuccess,
  fetchMetricsFailure,
  setCampaignSummary,
  setEmailPerformance,
  setEngagementMetrics,
  setSystemHealth,
  resetMetrics
} = metricsSlice.actions;

export default metricsSlice.reducer;
