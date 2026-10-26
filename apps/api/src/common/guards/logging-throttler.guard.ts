import { type ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { ThrottlerGuard, type ThrottlerLimitDetail } from '@nestjs/throttler'
import type { Request } from 'express'

@Injectable()
export class LoggingThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(LoggingThrottlerGuard.name)

  protected override async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>()

    this.logger.warn({
      message: 'Request rate limit exceeded',
      method: request.method,
      path: request.path,
      ip: request.ip,
      tracker: detail.tracker,
      ips: request.ips,
      remoteAddress: request.socket.remoteAddress,
      forwardedFor: request.headers['x-forwarded-for'],
      cfConnectingIp: request.headers['cf-connecting-ip'],
      cfRay: request.headers['cf-ray'],
      limit: detail.limit,
      ttlMs: detail.ttl,
      totalHits: detail.totalHits,
      retryAfterSeconds: detail.timeToBlockExpire,
    })

    await super.throwThrottlingException(context, detail)
  }
}
