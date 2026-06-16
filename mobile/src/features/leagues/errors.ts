/**
 * Extracts a user-facing message from an Axios error, preferring the backend's
 * RFC-7807 `detail` field. Optionally maps specific HTTP statuses to friendlier
 * copy.
 */
export function apiErrorMessage(
  error: unknown,
  statusOverrides: Record<number, string> = {},
): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: { status?: number; data?: { detail?: string } };
    }).response;

    const status = response?.status;
    if (status && statusOverrides[status]) {
      return statusOverrides[status];
    }
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }
  return 'Something went wrong. Please try again.';
}
