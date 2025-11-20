/**
 * Fee mode options for payment links
 */
export enum FeeMode {
  /** Merchant pays all fees (best customer experience) */
  NO_FEE = 'NO_FEE',
  /** Fees split 50/50 between merchant and customer */
  SPLIT_FEE = 'SPLIT_FEE',
  /** Customer pays all fees (maximizes merchant profit) */
  CUSTOMER_FEE = 'CUSTOMER_FEE',
}

/**
 * Payment status values
 */
export enum PaymentStatus {
  /** Payment is in progress, check again later */
  PENDING = 'PENDING',
  /** Payment completed successfully */
  CONFIRMED = 'CONFIRMED',
  /** Payment was declined, expired, or cancelled */
  FAILED = 'FAILED',
}

/**
 * Product or service information for payment link creation
 */
export interface ProductInfo {
  /** Product/service name (1-200 characters) */
  title: string;
  /** Amount in DZD (500 - 500,000) */
  amount: number;
  /** Optional description (max 1000 characters) */
  description?: string;
}

/**
 * Request data for creating a payment link
 */
export interface CreateLinkRequest {
  /** Product or service details */
  productInfo: ProductInfo;
  /** Who pays the withdrawal fee (default: NO_FEE) */
  feeMode?: FeeMode;
  /** Custom success message (max 500 characters) */
  successMessage?: string;
  /** Redirect URL after successful payment */
  redirectUrl?: string;
}

/**
 * Payment link details
 */
export interface PaymentLink {
  /** Unique payment reference code (e.g., "OCPL-A1B2C3-D4E5") */
  paymentRef: string;
  /** Complete payment URL to share with customers */
  paymentUrl: string;
  /** Product information */
  productInfo: ProductInfo;
  /** Fee mode */
  feeMode: FeeMode;
  /** Whether this is a sandbox/test payment */
  isSandbox: boolean;
  /** Payment link creation timestamp */
  createdAt: string;
  /** Success message */
  successMessage?: string;
  /** Redirect URL */
  redirectUrl?: string;
}

/**
 * Response from payment link creation
 */
export interface CreateLinkResponse {
  /** Full payment link details */
  paymentLink: PaymentLink;
  /** Complete URL to share with customers (same as paymentLink.paymentUrl) */
  paymentUrl: string;
  /** Payment reference code (same as paymentLink.paymentRef) - SAVE THIS! */
  paymentRef: string;
}

/**
 * Transaction details for confirmed payments
 */
export interface TransactionDetails {
  /** Transaction reference number */
  transactionRef: string;
  /** Amount paid in DZD */
  amount: number;
  /** Fee amount in DZD */
  fee: number;
  /** Net amount (amount - fee) */
  netAmount: number;
  /** Payment method used */
  paymentMethod: string;
  /** Transaction completion timestamp */
  completedAt: string;
}

/**
 * Response from payment status check
 */
export interface CheckPaymentResponse {
  /** Payment status */
  status: PaymentStatus;
  /** Status message */
  message: string;
  /** Payment reference code */
  paymentRef: string;
  /** Transaction details (only available for CONFIRMED status) */
  transactionDetails?: TransactionDetails;
}
