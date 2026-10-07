import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pakka_play/core/network/api_exception.dart';

void main() {
  final request = RequestOptions(path: '/api/v1/players/1');

  DioException withResponse(int status, Object? body) => DioException(
    requestOptions: request,
    response: Response(requestOptions: request, statusCode: status, data: body),
  );

  test('reads code and message from a backend ApiError body', () {
    final e = ApiException.fromDio(
      withResponse(404, {
        'status': 404,
        'code': 'NOT_FOUND',
        'message': "Player '1' was not found.",
      }),
    );

    expect(e.status, 404);
    expect(e.code, 'NOT_FOUND');
    expect(e.message, "Player '1' was not found.");
  });

  test('maps a missing response to NETWORK_ERROR', () {
    final e = ApiException.fromDio(
      DioException(
        requestOptions: request,
        type: DioExceptionType.connectionError,
      ),
    );

    expect(e.code, ApiException.networkError);
    expect(e.status, 0);
  });

  test('maps a non-ApiError body to UNKNOWN_ERROR', () {
    final e = ApiException.fromDio(
      withResponse(502, '<html>Bad gateway</html>'),
    );

    expect(e.code, 'UNKNOWN_ERROR');
    expect(e.status, 502);
  });
}
