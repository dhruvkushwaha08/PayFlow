package com.payflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateAdvanceStatusRequest {

    @NotBlank
    @Pattern(
            regexp = "DEDUCTED|CANCELLED",
            message = "Status must be DEDUCTED or CANCELLED"
    )
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}