package com.example.demo.controller;

import com.example.demo.model.dto.AiPredictionDto;
import com.example.demo.service.AiPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiPredictionService aiPredictionService;

    @GetMapping("/predict")
    public AiPredictionDto getPrediction() {
        return aiPredictionService.getPrediction();
    }
}
