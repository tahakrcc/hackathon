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

    @GetMapping("/recipients")
    public List<String> getRecipients() {
        return mailService.getAllRecipients();
    }

    @PostMapping("/recipients")
    public String addRecipient(@RequestBody String email) {
        mailService.addRecipient(email);
        return "Recipient added: " + email;
    }

    @DeleteMapping("/recipients")
    public String removeRecipient(@RequestParam String email) {
        mailService.removeRecipient(email);
        return "Recipient removed: " + email;
    }

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
