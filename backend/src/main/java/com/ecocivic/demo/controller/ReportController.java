package com.ecocivic.demo.controller;

import com.ecocivic.demo.ai.ClassificationService;
import com.ecocivic.demo.ai.SummaryService;
import com.ecocivic.demo.dto.DashboardSummary;
import com.ecocivic.demo.dto.UpdateStatusRequest;
import com.ecocivic.demo.entity.Report;
import com.ecocivic.demo.service.ReportService;
import com.ecocivic.demo.util.FileUploadUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Complaint report management")
public class ReportController {

    private final ReportService reportService;
    private final SummaryService summaryService;
    private final ClassificationService classificationService;

    public ReportController(ReportService reportService,
                            SummaryService summaryService,
                            ClassificationService classificationService) {
        this.reportService = reportService;
        this.summaryService = summaryService;
        this.classificationService = classificationService;
    }

    // ----------------------------------------------------------------
    // Submit report — supports both multipart/form-data AND JSON
    // ----------------------------------------------------------------

    /**
     * Multipart endpoint: accepts description, location, and optional image file.
     * Used by the frontend form.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit a report with optional image upload")
    public Report createReportMultipart(
            @RequestParam("description") String description,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {

        Report report = new Report();
        report.setDescription(description);
        report.setLocation(location);
        report.setTitle(title);

        // Save image if provided
        String imagePath = FileUploadUtil.saveImage(image);
        report.setImagePath(imagePath);

        return enrichAndSave(report, authentication.getName());
    }

    /**
     * JSON endpoint: used by direct API calls / Swagger.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Submit a report as JSON")
    public Report createReport(
            @RequestBody Report report,
            Authentication authentication) {
        return enrichAndSave(report, authentication.getName());
    }

    /** Shared AI-enrichment + save logic. */
    private Report enrichAndSave(Report report, String email) {
        return reportService.createReport(report, email);
    }

    // ----------------------------------------------------------------
    // Serve uploaded images
    // ----------------------------------------------------------------
    @GetMapping("/uploads/{filename:.+}")
    @Operation(summary = "Serve an uploaded report image")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads").toAbsolutePath().normalize().resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = java.nio.file.Files.probeContentType(file);
            MediaType mediaType = (contentType != null) ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG;
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ----------------------------------------------------------------
    // Standard CRUD endpoints
    // ----------------------------------------------------------------

    @GetMapping
    @Operation(summary = "Get all reports (admin)")
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    @GetMapping("/my")
    @Operation(summary = "Get reports submitted by the logged-in user")
    public List<Report> getMyReports(Authentication authentication) {
        return reportService.getReportsByUserEmail(authentication.getName());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary counts")
    public DashboardSummary getDashboardSummary() {
        return reportService.getDashboardSummary();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single report by ID")
    public Report getReportById(@PathVariable Long id) {
        return reportService.getReportById(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update the status of a report")
    public Report updateReportStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication authentication) {

        return reportService.updateReportStatus(
                id,
                request.getStatus(),
                authentication.getName()
        );
    }
}