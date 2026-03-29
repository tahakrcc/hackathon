package com.example.demo.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * CelesTrak GP (General Perturbations) JSON format model.
 */
@Data
public class SatelliteGpDto {
    @JsonProperty("OBJECT_NAME")
    private String objectName;

    @JsonProperty("OBJECT_ID")
    private String objectId;

    @JsonProperty("EPOCH")
    private String epoch;

    @JsonProperty("MEAN_MOTION")
    private double meanMotion; // rev/day

    @JsonProperty("ECCENTRICITY")
    private double eccentricity;

    @JsonProperty("INCLINATION")
    private double inclination; // deg

    @JsonProperty("RA_OF_ASC_NODE")
    private double raOfAscNode; // deg

    @JsonProperty("ARG_OF_PERICENTER")
    private double argOfPericenter; // deg

    @JsonProperty("MEAN_ANOMALY")
    private double meanAnomaly; // deg

    @JsonProperty("NORAD_CAT_ID")
    private long noradCatId;
    
    // Optional additional space weather risk score field
    private double riskScore;
}
