import 'package:dio/dio.dart';

/// Mirrors the backend error body (ADR-012) so features handle a single error type.
class ApiException implements Exception {
  const ApiException({
    required this.status,
    required this.code,
    required this.message,
  });

  /// Error code used when the server could not be reached.
  static const networkError = 'NETWORK_ERROR';

  final int status;
  final String code;
  final String message;

  factory ApiException.fromDio(DioException error) {
    final response = error.response;
    final body = response?.data;
    if (body is Map && body['code'] is String && body['message'] is String) {
      return ApiException(
        status: response!.statusCode ?? 0,
        code: body['code'] as String,
        message: body['message'] as String,
      );
    }
    if (response == null) {
      return const ApiException(
        status: 0,
        code: networkError,
        message:
            'Unable to reach the server. Check your connection and try again.',
      );
    }
    return ApiException(
      status: response.statusCode ?? 0,
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
    );
  }

  @override
  String toString() => 'ApiException($status, $code): $message';
}
