import { create } from "zustand";
import { Application, AnalyticsSummary, ApplicationStatus } from "@/types";
import { listApplications, fetchSummary, updateApplication as apiUpdateApplication, ListParams } from "@/lib/api";

interface Filters {
  loan_purpose: string;
  property_area: string;
  employment_status: string;
  status: string;
  page: number;
}

interface AppStore {
  // Applications
  applications: Application[];
  totalApps: number;
  totalPages: number;
  loadingApps: boolean;
  filters: Filters;

  // Summary
  summary: AnalyticsSummary | null;
  loadingSummary: boolean;

  // Actions
  setFilter: (key: keyof Filters, value: string | number) => void;
  resetFilters: () => void;
  loadApplications: () => Promise<void>;
  loadSummary: () => Promise<void>;
  updateApplicationStatus: (id: string, status: ApplicationStatus, officerName?: string) => Promise<void>;
  addApplication: (app: Application) => void;
  refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: Filters = {
  loan_purpose: "",
  property_area: "",
  employment_status: "",
  status: "",
  page: 1,
};

export const useAppStore = create<AppStore>((set, get) => ({
  applications: [],
  totalApps: 0,
  totalPages: 1,
  loadingApps: false,
  filters: { ...DEFAULT_FILTERS },

  summary: null,
  loadingSummary: false,

  setFilter: (key, value) => {
    set((s) => ({
      filters: { ...s.filters, [key]: value, page: key === "page" ? (value as number) : 1 },
    }));
    get().loadApplications();
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
    get().loadApplications();
  },

  loadApplications: async () => {
    set({ loadingApps: true });
    try {
      const { filters } = get();
      const params: ListParams = {
        page: filters.page,
        page_size: 50,
        ...(filters.loan_purpose && { loan_purpose: filters.loan_purpose }),
        ...(filters.property_area && { property_area: filters.property_area }),
        ...(filters.employment_status && { employment_status: filters.employment_status }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await listApplications(params);
      set({ applications: res.items, totalApps: res.total, totalPages: res.total_pages });
    } catch (e) {
      console.error("Failed to load applications:", e);
    } finally {
      set({ loadingApps: false });
    }
  },

  loadSummary: async () => {
    set({ loadingSummary: true });
    try {
      const summary = await fetchSummary();
      set({ summary });
    } catch (e) {
      console.error("Failed to load summary:", e);
    } finally {
      set({ loadingSummary: false });
    }
  },

  updateApplicationStatus: async (id, status, officerName) => {
    const updated = await apiUpdateApplication(id, status, officerName);
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? updated : a)),
    }));
  },

  addApplication: (app) => {
    set((s) => ({ applications: [app, ...s.applications], totalApps: s.totalApps + 1 }));
  },

  refresh: async () => {
    await Promise.all([get().loadApplications(), get().loadSummary()]);
  },
}));
