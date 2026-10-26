import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { APIError } from 'better-auth/api'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import type { Request, Response } from 'express'

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { AuthenticationService } from './authentication.service'
import { Public } from './decorators/public.decorator'
import { GetSignInMethodQueryDto } from './dtos/get-sign-in-method-query.dto'
import { GetSignInMethodResponseDto } from './dtos/get-sign-in-method-response.dto'
import { PhoneRequestPasswordResetDto } from './dtos/phone-request-password-reset.dto'
import { PhoneResetPasswordDto } from './dtos/phone-reset-password.dto'
import { PhoneSendOtpDto } from './dtos/phone-send-otp.dto'
import { PhoneSignInDto } from './dtos/phone-sign-in.dto'
import { PhoneVerifyDto } from './dtos/phone-verify.dto'
import { SetPasswordDto } from './dtos/set-password.dto'
import { UpdateUserDto } from './dtos/update-user.dto'

@Public()
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get('/get-session')
  async getSession(@Req() req: Request, @Res() res: Response) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Post('/update-user')
  async updateUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: UpdateUserDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Post('/set-password')
  async setPassword(
    @Req() req: Request,
    @Body() body: SetPasswordDto
  ): Promise<SuccessResponseDto> {
    try {
      await this.authenticationService.betterAuth.api.setPassword({
        body,
        headers: fromNodeHeaders(req.headers),
      })

      return new SuccessResponseDto()
    } catch (error: unknown) {
      if (error instanceof APIError) {
        throw new HttpException(error.body ?? error.message, error.statusCode)
      }

      throw new InternalServerErrorException()
    }
  }

  @Get('/get-sign-in-method')
  async getSignInMethod(
    @Query() { phoneNumber }: GetSignInMethodQueryDto
  ): Promise<GetSignInMethodResponseDto> {
    return {
      method: await this.authenticationService.getSignInMethod(phoneNumber),
    }
  }

  @Post('/sign-in/phone-number')
  async signInPhoneNumber(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: PhoneSignInDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 * 60 * 24 } })
  @Post('/phone-number/send-otp')
  async sendOtp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: PhoneSendOtpDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Post('/phone-number/verify')
  async verifyPhoneNumber(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: PhoneVerifyDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 * 60 * 24 } })
  @Post('/phone-number/request-password-reset')
  async requestPhonePasswordReset(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: PhoneRequestPasswordResetDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Post('/phone-number/reset-password')
  async resetPhonePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: PhoneResetPasswordDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Post('/sign-out')
  async signOut(@Req() req: Request, @Res() res: Response) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }
}
