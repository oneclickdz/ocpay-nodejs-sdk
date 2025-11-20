# OneClickDz OCPay Node.js SDK

[![npm version](https://img.shields.io/npm/v/@oneclickdz/ocpay-sdk.svg)](https://www.npmjs.com/package/@oneclickdz/ocpay-sdk)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2%2B-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Official Node.js/TypeScript SDK for integrating OneClickDz OCPay payment gateway. This SDK provides a simple and intuitive interface for creating payment links and checking payment status.

## Features

- ✅ **TypeScript Native** - Full TypeScript support with complete type definitions
- ✅ **Simple API** - Clean, intuitive interface with async/await
- ✅ **Type Safety** - Compile-time type checking and IntelliSense support
- ✅ **Error Handling** - Custom exceptions for different error types
- ✅ **Modern JavaScript** - ES2020+ features and best practices
- ✅ **Promise-based** - Native Promise support with async/await
- ✅ **Axios HTTP Client** - Reliable HTTP communication
- ✅ **Comprehensive Documentation** - Full JSDoc annotations

## Requirements

- Node.js 16.0.0 or higher
- npm or yarn

## Installation

Install via npm:

```bash
npm install @oneclickdz/ocpay-sdk
```

Or with yarn:

```bash
yarn add @oneclickdz/ocpay-sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import { OCPay } from '@oneclickdz/ocpay-sdk';

// Initialize with your API access token
const ocpay = new OCPay('your-api-access-token');
```

### 2. Create a Payment Link

```typescript
import { OCPay, FeeMode } from '@oneclickdz/ocpay-sdk';

const ocpay = new OCPay(process.env.ONECLICK_API_KEY);

// Create payment link request
const request = {
  productInfo: {
    title: 'Premium Subscription',
    amount: 5000, // Amount in DZD (500 - 500,000)
    description: 'Monthly access to all premium features',
  },
  feeMode: FeeMode.NO_FEE, // Merchant pays fees
  successMessage: 'Thank you for your purchase!',
  redirectUrl: 'https://yourstore.com/success?orderId=12345',
};

// Create the payment link
try {
  const response = await ocpay.createLink(request);

  // Share this URL with your customer
  console.log('Payment URL:', response.paymentUrl);

  // Save this reference for tracking
  console.log('Payment Reference:', response.paymentRef);

  // Store paymentRef in your database for order tracking
  // await saveOrderPaymentRef(orderId, response.paymentRef);
} catch (error) {
  if (error instanceof ValidationException) {
    // Handle validation errors (400)
    console.error('Validation error:', error.message);
  } else if (error instanceof UnauthorizedException) {
    // Handle authentication errors (403)
    console.error('Authentication error:', error.message);
  } else if (error instanceof ApiException) {
    // Handle other API errors
    console.error('API error:', error.message);
  }
}
```

### 3. Check Payment Status

```typescript
import { PaymentStatus } from '@oneclickdz/ocpay-sdk';

// Check payment status using the payment reference
try {
  const status = await ocpay.checkPayment('OCPL-A1B2C3-D4E5');

  if (status.status === PaymentStatus.CONFIRMED) {
    // Payment successful - fulfill the order
    console.log('Payment confirmed! Amount:', status.transactionDetails?.amount, 'DZD');
    await fulfillOrder(orderId);
  } else if (status.status === PaymentStatus.FAILED) {
    // Payment failed - mark order as failed
    console.log('Payment failed:', status.message);
    await markOrderFailed(orderId);
  } else {
    // Still pending - poll again later
    console.log('Payment pending...');
    await schedulePolling(orderId);
  }
} catch (error) {
  if (error instanceof NotFoundException) {
    console.error('Payment not found:', error.message);
  } else if (error instanceof PaymentExpiredException) {
    console.error('Payment link expired:', error.message);
  } else if (error instanceof ApiException) {
    console.error('API error:', error.message);
  }
}
```

## Complete Example: E-commerce Order Flow

```typescript
import {
  OCPay,
  FeeMode,
  PaymentStatus,
  ValidationException,
  ApiException,
} from '@oneclickdz/ocpay-sdk';

// Initialize SDK
const ocpay = new OCPay(process.env.ONECLICK_API_KEY!);

// Step 1: Create order in your system
const orderId = await createOrder({
  customerId: 123,
  items: [
    { name: 'Product A', price: 5000 },
    { name: 'Product B', price: 3000 },
  ],
  total: 8000,
});

// Step 2: Create payment link
try {
  const response = await ocpay.createLink({
    productInfo: {
      title: `Order #${orderId}`,
      amount: 8000,
      description: `Payment for order #${orderId}`,
    },
    feeMode: FeeMode.NO_FEE,
    successMessage: `Thank you! Your order #${orderId} is being processed.`,
    redirectUrl: `https://yourstore.com/orders/${orderId}/success`,
  });

  // Step 3: Save payment reference to order
  await updateOrder(orderId, {
    paymentRef: response.paymentRef,
    paymentUrl: response.paymentUrl,
    status: 'pending_payment',
  });

  // Step 4: Redirect customer to payment page
  // res.redirect(response.paymentUrl);
  console.log('Redirect to:', response.paymentUrl);
} catch (error) {
  // Handle error
  console.error('Payment link creation failed:', error.message);
  // showErrorPage('Failed to create payment link. Please try again.');
}

// Step 5: Poll payment status (in background job or webhook)
async function checkOrderPayment(orderId: string): Promise<void> {
  const order = await getOrder(orderId);

  if (!order || !order.paymentRef) {
    return;
  }

  try {
    const status = await ocpay.checkPayment(order.paymentRef);

    if (status.status === PaymentStatus.CONFIRMED) {
      // Mark order as paid and fulfill
      await updateOrder(orderId, {
        status: 'paid',
        paidAt: new Date(),
      });
      await fulfillOrder(orderId);
    } else if (status.status === PaymentStatus.FAILED) {
      // Mark order as failed
      await updateOrder(orderId, {
        status: 'payment_failed',
      });
    }
    // If pending, do nothing and check again later
  } catch (error) {
    console.error('Payment status check failed:', error.message);
  }
}
```

## API Reference

### OCPay Class

Main entry point for the SDK.

#### Constructor

```typescript
constructor(accessToken: string, options?: ClientOptions)
```

**Parameters:**

- `accessToken` (string) - Your OneClickDz API access token
- `options` (ClientOptions) - Optional client configuration:
  - `timeout` (number) - Request timeout in milliseconds (default: 30000)
  - `baseURL` (string) - Custom base URL (mainly for testing)
  - `headers` (object) - Additional headers to include in requests

**Example:**

```typescript
const ocpay = new OCPay('your-api-key', {
  timeout: 60000, // 60 seconds
});
```

#### Methods

##### `createLink(request: CreateLinkRequest): Promise<CreateLinkResponse>`

Creates a new payment link.

**Parameters:**

- `request` (CreateLinkRequest) - Payment link creation request

**Returns:** `Promise<CreateLinkResponse>` - Response containing payment URL and reference

**Throws:**

- `ValidationException` - Invalid request data (400)
- `UnauthorizedException` - Authentication failed (403)
- `ApiException` - Other API errors

##### `checkPayment(paymentRef: string): Promise<CheckPaymentResponse>`

Checks the status of a payment.

**Parameters:**

- `paymentRef` (string) - Payment reference code (e.g., "OCPL-A1B2C3-D4E5")

**Returns:** `Promise<CheckPaymentResponse>` - Payment status response

**Throws:**

- `NotFoundException` - Payment not found (404)
- `PaymentExpiredException` - Payment link expired (410)
- `ApiException` - Other API errors

### Types & Interfaces

#### ProductInfo

Product information for payment link creation.

```typescript
interface ProductInfo {
  title: string; // Product/service name (1-200 characters)
  amount: number; // Amount in DZD (500 - 500,000)
  description?: string; // Optional description (max 1000 characters)
}
```

#### CreateLinkRequest

Payment link creation request.

```typescript
interface CreateLinkRequest {
  productInfo: ProductInfo; // Required: Product information
  feeMode?: FeeMode; // Optional: Fee mode (default: NO_FEE)
  successMessage?: string; // Optional: Success message (max 500 chars)
  redirectUrl?: string; // Optional: Redirect URL after payment
}
```

#### FeeMode Enum

```typescript
enum FeeMode {
  NO_FEE = 'NO_FEE', // Merchant pays all fees (default)
  SPLIT_FEE = 'SPLIT_FEE', // Fees split 50/50
  CUSTOMER_FEE = 'CUSTOMER_FEE', // Customer pays all fees
}
```

#### CreateLinkResponse

Response from payment link creation.

```typescript
interface CreateLinkResponse {
  paymentLink: PaymentLink; // Full payment link details
  paymentUrl: string; // Complete URL to share with customers
  paymentRef: string; // Payment reference code (SAVE THIS!)
}
```

#### CheckPaymentResponse

Payment status response.

```typescript
interface CheckPaymentResponse {
  status: PaymentStatus; // Payment status enum
  message: string; // Status message
  paymentRef: string; // Payment reference code
  transactionDetails?: TransactionDetails; // Details (if available)
}
```

#### PaymentStatus Enum

```typescript
enum PaymentStatus {
  PENDING = 'PENDING', // Payment in progress
  CONFIRMED = 'CONFIRMED', // Payment completed successfully
  FAILED = 'FAILED', // Payment declined, expired, or cancelled
}
```

### Exception Classes

All exceptions extend `OCPayException`:

- `ApiException` - Base API exception
- `ValidationException` - Request validation failed (400)
- `UnauthorizedException` - Authentication failed (403)
- `NotFoundException` - Resource not found (404)
- `PaymentExpiredException` - Payment link expired (410)

All API exceptions include:

- `getRequestId()` - Get request ID for support
- `getStatusCode()` - Get HTTP status code
- `getErrorData()` - Get error data

## Important Notes

### Merchant Validation

**Required**: Complete merchant validation at [https://oneclickdz.com/#/OcPay/merchant-info](https://oneclickdz.com/#/OcPay/merchant-info) before using the API.

### Amount Limits

- **Minimum**: 500 DZD
- **Maximum**: 500,000 DZD
- **Format**: Must be whole numbers (no decimals)

### Fee Structure

- **0%** if using OneClick balance
- **1%** withdrawal fee only (configurable per transaction)

### Link Expiration

Payment links expire **20 minutes** after creation if payment is not initiated. After expiration, the status will be `FAILED`.

### Payment Status Flow

1. **PENDING** - Payment is in progress, wait and poll again
2. **CONFIRMED** - Payment completed successfully, fulfill the order
3. **FAILED** - Payment was declined, expired, or cancelled

## Error Handling

```typescript
import {
  ValidationException,
  UnauthorizedException,
  ApiException,
} from '@oneclickdz/ocpay-sdk';

try {
  const response = await ocpay.createLink(request);
} catch (error) {
  if (error instanceof ValidationException) {
    // Handle validation errors (400)
    console.error('Validation error:', error.message);
    console.error('Request ID:', error.getRequestId());
  } else if (error instanceof UnauthorizedException) {
    // Handle authentication errors (403)
    console.error('Authentication failed. Check your API key.');
  } else if (error instanceof ApiException) {
    // Handle other API errors
    console.error('API error:', error.message);
    console.error('Status code:', error.getStatusCode());
    console.error('Request ID:', error.getRequestId());
  }
}
```

## Examples

Complete integration examples are available in the `examples/` directory:

- **Basic Usage** - Simple payment link creation and status checking
- **Express.js Integration** - Complete Express.js integration with REST API
- **NestJS Integration** - Full NestJS module with service and controller

## Framework Integration Guides

### Express.js

```typescript
import express from 'express';
import { OCPay, FeeMode, PaymentStatus } from '@oneclickdz/ocpay-sdk';

const app = express();
const ocpay = new OCPay(process.env.ONECLICK_API_KEY!);

app.post('/api/orders/:orderId/payment', async (req, res) => {
  const { orderId } = req.params;
  const order = await getOrder(orderId);

  try {
    const response = await ocpay.createLink({
      productInfo: {
        title: `Order #${orderId}`,
        amount: order.total,
      },
      feeMode: FeeMode.NO_FEE,
      redirectUrl: `${req.protocol}://${req.get('host')}/orders/${orderId}/success`,
    });

    await updateOrder(orderId, { paymentRef: response.paymentRef });
    res.json({ paymentUrl: response.paymentUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payments/:paymentRef/status', async (req, res) => {
  try {
    const status = await ocpay.checkPayment(req.params.paymentRef);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { OCPay, CreateLinkRequest, FeeMode } from '@oneclickdz/ocpay-sdk';

@Injectable()
export class PaymentService {
  private readonly ocpay: OCPay;

  constructor() {
    this.ocpay = new OCPay(process.env.ONECLICK_API_KEY!);
  }

  async createPaymentLink(orderId: string, amount: number): Promise<string> {
    const response = await this.ocpay.createLink({
      productInfo: {
        title: `Order #${orderId}`,
        amount,
      },
      feeMode: FeeMode.NO_FEE,
      redirectUrl: `https://yourstore.com/orders/${orderId}/success`,
    });

    return response.paymentUrl;
  }

  async checkPaymentStatus(paymentRef: string) {
    return await this.ocpay.checkPayment(paymentRef);
  }
}
```

## Testing

### Unit Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Using Sandbox Mode

The API automatically uses sandbox mode for test accounts. Check the `isSandbox` property in responses:

```typescript
const response = await ocpay.createLink(request);
if (response.paymentLink.isSandbox) {
  console.log('This is a test payment link');
}
```

## TypeScript Support

This SDK is written in TypeScript and includes complete type definitions. No need to install `@types` packages!

```typescript
import { OCPay, CreateLinkRequest, PaymentStatus } from '@oneclickdz/ocpay-sdk';

// Full IntelliSense and type checking
const request: CreateLinkRequest = {
  productInfo: {
    title: 'Product',
    amount: 5000,
  },
};
```

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
npm run format:check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This SDK is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [https://docs.oneclickdz.com](https://docs.oneclickdz.com)
- **API Reference**: [https://docs.oneclickdz.com/api-reference/ocpay](https://docs.oneclickdz.com/api-reference/ocpay)
- **Support Email**: support@oneclickdz.com

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Made with ❤️ by [OneClickDz](https://oneclickdz.com)
