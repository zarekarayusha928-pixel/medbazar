import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class PaymentController {
  async getGatewayConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = paymentService.getGatewayConfig();
      sendSuccess(res, config, 'Payment gateway configuration retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async getPaymentByOrderId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const payment = await paymentService.getPaymentByOrderId(req.params.orderId as string, req.user);
      sendSuccess(res, payment, 'Payment record retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }
      const result = await paymentService.verifyPayment(req.body, req.user);
      sendSuccess(res, result, result.verified ? 'Payment successfully verified.' : 'Payment pending verification.');
    } catch (err) {
      next(err);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gateway = req.params.gateway as string;
      const signatureHeader = (req.headers['x-razorpay-signature'] || req.headers['stripe-signature']) as string | undefined;
      const result = await paymentService.processWebhook(gateway, signatureHeader, req.body);
      sendSuccess(res, result, 'Webhook event processed.');
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
