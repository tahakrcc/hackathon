package com.example.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XRayFluxDto {
    private String time_tag;
    private String satellite;
    private String flux;
    private String observed_flux;
    private String energy;
    private String current_class;
    private String current_ratio;
}
