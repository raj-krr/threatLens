import { API } from "./index";

export const DashboardAPI = {
  getStats: (projectId) =>
    API.get(`/api/dashboard/stats/${projectId}`),

  getAllLogs: (projectId) =>
    API.get(`/api/dashboard/logs/${projectId}`),

  getBlockedLogs: (projectId) =>
    API.get(`/api/dashboard/logs/${projectId}?status=blocked`),

  getFlaggedLogs: (projectId) =>
    API.get(`/api/dashboard/logs/${projectId}?status=flagged`),

  getByAttackType: (projectId, type) =>
    API.get(`/api/dashboard/logs/${projectId}?attackType=${type}`),

  getWithLimit: (projectId, limit) =>
    API.get(`/api/dashboard/logs/${projectId}?limit=${limit}`),

  getCombined: (projectId) =>
    API.get(
      `/api/dashboard/logs/${projectId}?status=blocked&attackType=BRUTE_FORCE&limit=5`
    ),

  unblockIP: (projectId, ip) =>
    API.delete(`/api/dashboard/unblock/${projectId}/${ip}`),
};