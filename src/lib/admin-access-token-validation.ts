import {
  AdminAccessGatewayError,
  validateAdminAccessTokenWithGateway,
} from "@/lib/admin-access-gateway";

export interface AdminAccessTokenValidation {
  valid: boolean;
  expiresAt: string | null;
  requestId: string | null;
}

export class AdminAccessValidationError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminAccessValidationError";
  }
}

export async function validateAdminAccessToken(
  accessToken: string,
): Promise<AdminAccessTokenValidation> {
  try {
    return await validateAdminAccessTokenWithGateway(accessToken);
  } catch (error) {
    if (error instanceof AdminAccessGatewayError) {
      throw new AdminAccessValidationError(
        error.statusCode,
        error.code,
        error.code === "INVALID_TOKEN"
          ? "Administrator authorization is invalid or expired."
          : error.message,
      );
    }

    throw new AdminAccessValidationError(
      503,
      "ADMIN_ACCESS_VALIDATION_UNAVAILABLE",
      "Administrator authorization validation is unavailable.",
    );
  }
}
