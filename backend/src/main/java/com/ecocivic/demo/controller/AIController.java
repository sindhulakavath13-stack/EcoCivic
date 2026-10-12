package com.ecocivic.demo.controller;

import com.ecocivic.demo.ai.AiChatService;
import com.ecocivic.demo.ai.InsightGenerationService;
import com.ecocivic.demo.dto.AIRequest;
import com.ecocivic.demo.dto.AIResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Gemini-powered AI endpoints")
public class AIController {

    private final AiChatService chatService;
    private final InsightGenerationService insightService;

    public AIController(AiChatService chatService,
                        InsightGenerationService insightService) {
        this.chatService = chatService;
        this.insightService = insightService;
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with EcoCivic AI",
               description = "Send a sustainability question and get an AI response")
    public AIResponse chat(@RequestBody AIRequest request) {
        return new AIResponse(chatService.chat(request.getMessage()));
    }

    @PostMapping("/insights")
    @Operation(summary = "Generate dashboard insights",
               description = "Generate trend insights from complaint statistics JSON")
    public AIResponse insights(@RequestBody AIRequest request) {
        return new AIResponse(insightService.generateInsight(request.getMessage()));
    }
}