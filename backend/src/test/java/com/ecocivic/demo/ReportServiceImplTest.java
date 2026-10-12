package com.ecocivic.demo;

import com.ecocivic.demo.entity.Report;
import com.ecocivic.demo.entity.User;
import com.ecocivic.demo.exception.BadRequestException;
import com.ecocivic.demo.exception.ResourceNotFoundException;
import com.ecocivic.demo.repository.ReportRepository;
import com.ecocivic.demo.repository.UserRepository;
import com.ecocivic.demo.serviceimpl.ReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReportServiceImplTest {

    @Mock private ReportRepository reportRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private User owner;
    private User admin;
    private Report report;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");
        owner.setRole("user");

        admin = new User();
        admin.setId(2L);
        admin.setEmail("admin@test.com");
        admin.setRole("admin");

        report = new Report();
        report.setId(10L);
        report.setDescription("Garbage dump near lake");
        report.setStatus("Pending");
        report.setUser(owner);
    }

    // ------------------------------------------------------------------
    // createReport
    // ------------------------------------------------------------------

    @Test
    void createReport_success_setsStatusAndUser() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

        Report input = new Report();
        input.setDescription("Test complaint");

        Report result = reportService.createReport(input, "owner@test.com");

        assertEquals("Pending", result.getStatus());
        assertEquals(owner, result.getUser());
        assertNotNull(result.getCreatedAt());
    }

    @Test
    void createReport_unknownUser_throwsNotFound() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> reportService.createReport(new Report(), "ghost@test.com"));
    }

    // ------------------------------------------------------------------
    // getReportById
    // ------------------------------------------------------------------

    @Test
    void getReportById_notFound_throwsNotFound() {
        when(reportRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> reportService.getReportById(99L));
    }

    // ------------------------------------------------------------------
    // updateReportStatus
    // ------------------------------------------------------------------

    @Test
    void updateReportStatus_ownerCanUpdateOwnReport() {
        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

        Report updated = reportService.updateReportStatus(10L, "Resolved", "owner@test.com");

        assertEquals("Resolved", updated.getStatus());
    }

    @Test
    void updateReportStatus_adminCanUpdateAnyReport() {
        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

        Report updated = reportService.updateReportStatus(10L, "In Progress", "admin@test.com");

        assertEquals("In Progress", updated.getStatus());
    }

    @Test
    void updateReportStatus_otherUserBlocked_throwsBadRequest() {
        User other = new User();
        other.setEmail("other@test.com");
        other.setRole("user");

        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));

        assertThrows(BadRequestException.class,
                () -> reportService.updateReportStatus(10L, "Resolved", "other@test.com"));
    }

    @Test
    void updateReportStatus_invalidStatus_throwsBadRequest() {
        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));

        assertThrows(BadRequestException.class,
                () -> reportService.updateReportStatus(10L, "DONE", "owner@test.com"));
    }

    // ------------------------------------------------------------------
    // getDashboardSummary
    // ------------------------------------------------------------------

    @Test
    void getDashboardSummary_correctCounts() {
        Report r1 = new Report(); r1.setStatus("Pending");
        Report r2 = new Report(); r2.setStatus("Pending");
        Report r3 = new Report(); r3.setStatus("In Progress");
        Report r4 = new Report(); r4.setStatus("Resolved");

        when(reportRepository.findAll()).thenReturn(List.of(r1, r2, r3, r4));

        var summary = reportService.getDashboardSummary();

        assertEquals(4, summary.getTotalReports());
        assertEquals(2, summary.getPendingReports());
        assertEquals(1, summary.getInProgressReports());
        assertEquals(1, summary.getResolvedReports());
    }
}
