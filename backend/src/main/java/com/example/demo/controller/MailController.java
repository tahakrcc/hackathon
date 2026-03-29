package com.example.demo.controller;

import com.example.demo.service.core.MailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MailController {

    private final MailService mailService;

    @PostMapping("/send-alert")
    public String sendAlert(@RequestBody AlertMailRequest request) {
        mailService.sendEmergencyAlert(
            request.getRecipients(),
            request.getIntensity(),
            request.getAiComment(),
            request.getImpactTime()
        );
        return "SUCCESS: Alert sent to " + request.getRecipients().size() + " addresses.";
    }

    @Data
    public static class AlertMailRequest {
        private List<String> recipients;
        private String intensity;
        private String aiComment;
        private String impactTime;
    }
}
