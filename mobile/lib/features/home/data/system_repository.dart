import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_provider.dart';

enum BackendStatus { up, down }

class SystemRepository {
  SystemRepository(this._dio);

  final Dio _dio;

  Future<BackendStatus> backendStatus() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/actuator/health');
      return response.data?['status'] == 'UP'
          ? BackendStatus.up
          : BackendStatus.down;
    } on DioException {
      return BackendStatus.down;
    }
  }
}

final systemRepositoryProvider = Provider<SystemRepository>(
  (ref) => SystemRepository(ref.watch(dioProvider)),
);

final backendStatusProvider = FutureProvider.autoDispose<BackendStatus>(
  (ref) => ref.watch(systemRepositoryProvider).backendStatus(),
);
