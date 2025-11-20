import { FeeMode, ProductInfo, CreateLinkRequest } from './types';

/**
 * Validates product information
 * @throws Error if validation fails
 */
export function validateProductInfo(productInfo: ProductInfo): void {
  if (!productInfo.title || productInfo.title.trim().length === 0) {
    throw new Error('Product title is required');
  }

  if (productInfo.title.length > 200) {
    throw new Error('Product title must not exceed 200 characters');
  }

  if (!Number.isInteger(productInfo.amount)) {
    throw new Error('Amount must be a whole number (no decimals)');
  }

  if (productInfo.amount < 500) {
    throw new Error('Amount must be at least 500 DZD');
  }

  if (productInfo.amount > 500000) {
    throw new Error('Amount must not exceed 500,000 DZD');
  }

  if (productInfo.description && productInfo.description.length > 1000) {
    throw new Error('Product description must not exceed 1000 characters');
  }
}

/**
 * Validates fee mode
 * @throws Error if validation fails
 */
export function validateFeeMode(feeMode: FeeMode): void {
  const validFeeModes = [FeeMode.NO_FEE, FeeMode.SPLIT_FEE, FeeMode.CUSTOMER_FEE];
  if (!validFeeModes.includes(feeMode)) {
    throw new Error(
      `Invalid fee mode. Must be one of: ${validFeeModes.join(', ')}`
    );
  }
}

/**
 * Validates create link request
 * @throws Error if validation fails
 */
export function validateCreateLinkRequest(request: CreateLinkRequest): void {
  if (!request.productInfo) {
    throw new Error('Product info is required');
  }

  validateProductInfo(request.productInfo);

  if (request.feeMode) {
    validateFeeMode(request.feeMode);
  }

  if (request.successMessage && request.successMessage.length > 500) {
    throw new Error('Success message must not exceed 500 characters');
  }

  if (request.redirectUrl && !isValidUrl(request.redirectUrl)) {
    throw new Error('Redirect URL must be a valid HTTP/HTTPS URL');
  }
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new (globalThis as any).URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}
