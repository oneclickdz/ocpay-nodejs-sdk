import { Client } from './client';
import {
  CreateLinkRequest,
  CreateLinkResponse,
  CheckPaymentResponse,
  FeeMode,
} from './types';
import { validateCreateLinkRequest } from './validators';

/**
 * OCPay service for payment operations
 *
 * Handles payment link creation and status checking.
 */
export class OCPayService {
  private static readonly ENDPOINT_CREATE_LINK = '/v3/ocpay/createLink';
  private static readonly ENDPOINT_CHECK_PAYMENT = '/v3/ocpay/checkPayment';

  constructor(private readonly client: Client) {}

  /**
   * Create a payment link
   *
   * @param request Payment link creation request
   * @returns Payment link response
   * @throws ValidationException if request data is invalid
   * @throws UnauthorizedException if authentication fails
   * @throws ApiException for other API errors
   *
   * @example
   * ```typescript
   * const request = {
   *   productInfo: {
   *     title: 'Premium Subscription',
   *     amount: 5000,
   *     description: 'Monthly access to premium features'
   *   },
   *   feeMode: FeeMode.NO_FEE,
   *   successMessage: 'Thank you for your purchase!',
   *   redirectUrl: 'https://yourstore.com/success'
   * };
   *
   * const response = await service.createLink(request);
   * console.log('Payment URL:', response.paymentUrl);
   * console.log('Payment Ref:', response.paymentRef);
   * ```
   */
  async createLink(request: CreateLinkRequest): Promise<CreateLinkResponse> {
    // Validate request before sending
    validateCreateLinkRequest(request);

    // Set default fee mode if not provided
    const requestData = {
      ...request,
      feeMode: request.feeMode || FeeMode.NO_FEE,
    };

    const response = await this.client.post<CreateLinkResponse>(
      OCPayService.ENDPOINT_CREATE_LINK,
      requestData
    );

    return response.data;
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
   * const status = await service.checkPayment('OCPL-A1B2C3-D4E5');
   *
   * if (status.status === PaymentStatus.CONFIRMED) {
   *   console.log('Payment confirmed!');
   *   console.log('Amount:', status.transactionDetails?.amount);
   * } else if (status.status === PaymentStatus.PENDING) {
   *   console.log('Payment still pending...');
   * } else {
   *   console.log('Payment failed:', status.message);
   * }
   * ```
   */
  async checkPayment(paymentRef: string): Promise<CheckPaymentResponse> {
    if (!paymentRef || paymentRef.trim().length === 0) {
      throw new Error('Payment reference is required');
    }

    const endpoint = `${OCPayService.ENDPOINT_CHECK_PAYMENT}/${paymentRef}`;
    const response = await this.client.get<CheckPaymentResponse>(endpoint);

    return response.data;
  }
}
