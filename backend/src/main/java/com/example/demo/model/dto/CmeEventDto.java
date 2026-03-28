package com.example.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmeEventDto {
    private String activityID;
    private String startTime;
    private String sourceLocation;
    private String link;
    private String note;
    private List<Map<String, Object>> cmeAnalyses;
}
