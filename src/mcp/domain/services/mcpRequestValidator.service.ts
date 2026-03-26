import { McpRequestEntity } from '../entities/mcpRequest.entity';

export class McpRequestValidatorService {
  static normalize(request: McpRequestEntity) {
    return {
      id: request.id ?? null,
      method: String(request.method || ''),
      params: (request.params || {}) as Record<string, unknown>,
    };
  }
}
