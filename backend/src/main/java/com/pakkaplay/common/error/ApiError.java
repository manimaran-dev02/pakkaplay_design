package com.pakkaplay.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Error body returned by every API endpoint (see ADR-012).
 *
 * @param errors field-level validation errors; omitted when empty
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        List<FieldError> errors) {

    public record FieldError(String field, String message) {}

    public static ApiError of(ErrorCode code, String message, String path, Instant now) {
        return new ApiError(now, code.status().value(), code.name(), message, path, List.of());
    }
}
