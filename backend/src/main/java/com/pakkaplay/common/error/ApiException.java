package com.pakkaplay.common.error;

/**
 * Base exception for expected business errors. Its message is safe to show to API clients;
 * anything not extending this class is reported as {@link ErrorCode#INTERNAL_ERROR}.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode code;

    public ApiException(ErrorCode code) {
        this(code, code.defaultMessage());
    }

    public ApiException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode code() {
        return code;
    }

    public static ApiException notFound(String resource, Object id) {
        return new ApiException(ErrorCode.NOT_FOUND, resource + " '" + id + "' was not found.");
    }
}
