package com.ecocivic.demo.serviceimpl;

import com.ecocivic.demo.dto.DashboardSummary;
import com.ecocivic.demo.entity.Report;
import com.ecocivic.demo.entity.User;
import com.ecocivic.demo.exception.BadRequestException;
import com.ecocivic.demo.exception.ResourceNotFoundException;
import com.ecocivic.demo.repository.ReportRepository;
import com.ecocivic.demo.repository.UserRepository;
import com.ecocivic.demo.service.ReportService;
import com.ecocivic.demo.ai.ClassificationService;
import com.ecocivic.demo.ai.SummaryService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ClassificationService classificationService;
    private final SummaryService summaryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReportServiceImpl(ReportRepository reportRepository,
                             UserRepository userRepository,
                             ClassificationService classificationService,
                             SummaryService summaryService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.classificationService = classificationService;
        this.summaryService = summaryService;
    }

    @Override
    public Report createReport(Report report, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        report.setUser(user);
        report.setStatus("Pending");
        report.setCreatedAt(LocalDateTime.now());
        
        // AI Review
        try {
            String classificationJson = classificationService.classify(report.getDescription());
            // Gemini might wrap JSON in markdown block like ```json ... ```
            if (classificationJson != null) {
                classificationJson = classificationJson.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode jsonNode = objectMapper.readTree(classificationJson);
                if (jsonNode.has("category")) {
                    report.setCategory(jsonNode.get("category").asText());
                }
                if (jsonNode.has("priority")) {
                    report.setPriority(jsonNode.get("priority").asText());
                }
            }
            
            String summary = summaryService.summarise(report.getDescription());
            report.setSummary(summary);
            
            // AI review succeeded — promote status
            report.setStatus("AI Verified");
        } catch (Exception e) {
            // Log the error but allow the report to be saved without AI review
            System.err.println("AI Review failed: " + e.getMessage());
        }

        return reportRepository.save(report);
    }

    @Override
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Override
    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Report with id " + id + " not found"));
    }

    @Override
    public List<Report> getReportsByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reportRepository.findByUserId(user.getId());
    }

    @Override
    public Report updateReportStatus(Long id, String status, String email) {
        Report report = getReportById(id);

        // Admins can update any report; regular users only their own
        if (!report.getUser().getEmail().equals(email)) {
            User requester = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (!"admin".equalsIgnoreCase(requester.getRole())) {
                throw new BadRequestException("You can only update your own reports");
            }
        }

        List<String> validStatuses = List.of("Pending", "AI Verified", "In Progress", "Resolved");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException(
                    "Invalid status. Allowed values: Pending, AI Verified, In Progress, Resolved");
        }

        report.setStatus(status);
        return reportRepository.save(report);
    }

    @Override
    public DashboardSummary getDashboardSummary() {
        List<Report> reports = reportRepository.findAll();

        long total = reports.size();
        long pending = reports.stream().filter(r -> "Pending".equals(r.getStatus())).count();
        long aiVerified = reports.stream().filter(r -> "AI Verified".equals(r.getStatus())).count();
        long inProgress = reports.stream().filter(r -> "In Progress".equals(r.getStatus())).count();
        long resolved = reports.stream().filter(r -> "Resolved".equals(r.getStatus())).count();

        return new DashboardSummary(total, pending, aiVerified, inProgress, resolved);
    }
}
