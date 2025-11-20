# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-20

### Added

- Initial release of OCPay Node.js SDK
- TypeScript support with complete type definitions
- Payment link creation (`createLink`)
- Payment status checking (`checkPayment`)
- Custom exception classes for different error types
- Comprehensive validation for request data
- Full JSDoc documentation
- Support for FeeMode options (NO_FEE, SPLIT_FEE, CUSTOMER_FEE)
- PaymentStatus enum (PENDING, CONFIRMED, FAILED)
- Axios-based HTTP client with automatic error handling
- Configurable timeout and custom headers support

### Documentation

- Complete README with examples
- API reference documentation
- Express.js integration guide
- NestJS integration guide
- Error handling examples

[1.0.0]: https://github.com/oneclickdz/ocpay-node-sdk/releases/tag/v1.0.0
