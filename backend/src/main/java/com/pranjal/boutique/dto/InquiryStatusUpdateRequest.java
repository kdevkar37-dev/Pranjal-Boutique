package com.pranjal.boutique.dto;

import com.pranjal.boutique.model.InquiryStatus;
import jakarta.validation.constraints.NotNull;

public record InquiryStatusUpdateRequest(@NotNull InquiryStatus status) {
}
