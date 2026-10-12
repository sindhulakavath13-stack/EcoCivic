package com.ecocivic.demo.dto;

public class DashboardSummary {

    private long totalReports;
    private long pendingReports;
    private long aiVerifiedReports;
    private long inProgressReports;
    private long resolvedReports;

    public DashboardSummary() {
    }

    public DashboardSummary(
            long totalReports,
            long pendingReports,
            long aiVerifiedReports,
            long inProgressReports,
            long resolvedReports) {

        this.totalReports = totalReports;
        this.pendingReports = pendingReports;
        this.aiVerifiedReports = aiVerifiedReports;
        this.inProgressReports = inProgressReports;
        this.resolvedReports = resolvedReports;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public long getAiVerifiedReports() {
        return aiVerifiedReports;
    }

    public long getInProgressReports() {
        return inProgressReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }
}