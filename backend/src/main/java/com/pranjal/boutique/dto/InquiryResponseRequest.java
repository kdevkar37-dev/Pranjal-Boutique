package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;

public class InquiryResponseRequest {

    @NotBlank(message = "Response message is required")
    private String adminResponse;

    public InquiryResponseRequest() {
    }

    public InquiryResponseRequest(String adminResponse) {
        this.adminResponse = adminResponse;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }
}
