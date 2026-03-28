package com.example.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolarMagDto {
    private String time_tag;
    private String bx_gsm;
    private String by_gsm;
    private String bz_gsm;
    private String lon_gsm;
    private String lat_gsm;
    private String bt;
}
