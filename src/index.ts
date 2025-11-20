import { Client, ClientOptions } from './client';
import { OCPayService } from './ocpay-service';
import { CreateLinkRequest, CreateLinkResponse, CheckPaymentResponse } from './types';

/**
 * OneClickDz OCPay Node.js SDK
 *
 * Official Node.js SDK for integrating OneClickDz OCPay payment gateway.
 *
 * This SDK provides a simple and intuitive interface for:
 * - Creating single-use payment links
 * - Checking payment status
 * - Handling payment callbacks
 *
 * @example
 * ```typescript
 * import { OCPay, FeeMode } from '@oneclickdz/ocpay-sdk';
 *
 * // Initialize SDK
 * const ocpay = new OCPay('your-api-key');
 *
 * // Create a payment link
 * const response = await ocpay.createLink({
 *   productInfo: {
 *     title: 'Premium Subscription',
 *     amount: 5000,
 *     description: 'Monthly access to premium features'
 *   },
 *   feeMode: FeeMode.NO_FEE,
 *   successMessage: 'Thank you for your purchase!',
 *   redirectUrl: 'https://yourstore.com/success'
 * });
 *
 * console.log('Payment URL:', response.paymentUrl);
 * console.log('Payment Ref:', response.paymentRef);
 *
 * // Check payment status
 * const status = await ocpay.checkPayment(response.paymentRef);
 * if (status.status === PaymentStatus.CONFIRMED) {
 *   console.log('Payment confirmed!');
 * }
 * ```
 *
 * @see https://docs.oneclickdz.com/api-reference/ocpay
 */
export class OCPay {
  private readonly ocpayService: OCPayService;

  /**
   * Create a new OCPay SDK instance
   *
   * @param accessToken Your OneClickDz API access token
   * @param options Additional client options (timeout, etc.)
   *
   * @example
   * ```typescript
   * const ocpay = new OCPay(process.env.ONECLICK_API_KEY);
   * ```
   *
   * @example With custom options
   * ```typescript
   * const ocpay = new OCPay(process.env.ONECLICK_API_KEY, {
   *   timeout: 60000, // 60 seconds
   * });
   * ```
   */
  constructor(accessToken: string, options: ClientOptions = {}) {
    const client = new Client(accessToken, options);
    this.ocpayService = new OCPayService(client);
  }

  /**
   * Create a payment link
   *
   * @param request Payment link creation request
   * @returns Payment link response with URL and reference
   * @throws ValidationException if request data is invalid
   * @throws UnauthorizedException if authentication fails
   * @throws ApiException for other API errors
   *
   * @example
   * ```typescript
   * const response = await ocpay.createLink({
   *   productInfo: {
   *     title: 'Order #12345',
   *     amount: 8000,
   *     description: 'Payment for order #12345'
   *   },
   *   feeMode: FeeMode.NO_FEE,
   *   redirectUrl: 'https://yourstore.com/orders/12345/success'
   * });
   *
   * // Save paymentRef with your order!
   * await db.orders.update(orderId, {
   *   paymentRef: response.paymentRef
   * });
   *
   * // Redirect customer to payment page
   * res.redirect(response.paymentUrl);
   * ```
   */
  async createLink(request: CreateLinkRequest): Promise<CreateLinkResponse> {
    return this.ocpayService.createLink(request);
  }

  /**
   * Check payment status
   *
   * @param paymentRef Payment reference code (e.g., "OCPL-A1B2C3-D4E5")
   * @returns Payment status response
   * @throws NotFoundException if payment not found
   * @throws PaymentExpiredException if payment link expired
   * @throws UnauthorizedException if authentication fails
   * @throws ApiException for other API errors
   *
   * @example
   * ```typescript
   * const status = await ocpay.checkPayment('OCPL-A1B2C3-D4E5');
   *
   * switch (status.status) {
   *   case PaymentStatus.CONFIRMED:
   *     // Payment successful - fulfill the order
   *     await fulfillOrder(orderId);
   *     break;
   *
   *   case PaymentStatus.FAILED:
   *     // Payment failed - mark order as failed
   *     await markOrderFailed(orderId);
   *     break;
   *
   *   case PaymentStatus.PENDING:
   *     // Still pending - check again later
   *     await schedulePolling(orderId);
   *     break;
   * }
   * ```
   */
  async checkPayment(paymentRef: string): Promise<CheckPaymentResponse> {
    return this.ocpayService.checkPayment(paymentRef);
  }

  /**
   * Get the underlying OCPay service instance
   * (Useful for advanced use cases or testing)
   *
   * @returns OCPayService instance
   */
  getService(): OCPayService {
    return this.ocpayService;
  }
}

// Re-export types and enums for convenience
export {
  FeeMode,
  PaymentStatus,
  CreateLinkRequest,
  CreateLinkResponse,
  CheckPaymentResponse,
  ProductInfo,
  PaymentLink,
  TransactionDetails,
} from './types';

// Re-export exceptions
export {
  OCPayException,
  ApiException,
  ValidationException,
  UnauthorizedException,
  NotFoundException,
  PaymentExpiredException,
} from './exceptions';

// Re-export client types
export { ClientOptions } from './client';
