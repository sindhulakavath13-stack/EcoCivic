package com.ecocivic.demo.service;

import com.ecocivic.demo.dto.DashboardSummary;
import com.ecocivic.demo.entity.Report;

import java.util.List;

public interface ReportService {

    Report createReport(Report report, String userEmail);

    List<Report> getAllReports();

    Report getReportById(Long id);

    List<Report> getReportsByUserEmail(String email);

    Report updateReportStatus(Long id, String status, String userEmail);

    DashboardSummary getDashboardSummary();
}