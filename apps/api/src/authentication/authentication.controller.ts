import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { toNodeHandler } from 'better-auth/node'
import type { Request, Response } from 'express'

import { AuthenticationService } from './authentication.service'
import { Public } from './decorators/public.decorator'
import { PhoneRequestPasswordResetDto } from './dtos/phone-request-password-reset.dto'
import { PhoneResetPasswordDto } from './dtos/phone-reset-password.dto'
import { PhoneSendOtpDto } from './dtos/phone-send-otp.dto'
import { PhoneSignInDto } from './dtos/phone-sign-in.dto'
import { PhoneVerifyDto } from './dtos/phone-verify.dto'
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

  @Post('/sign-in/phone-number')
  async signInPhoneNumber(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _: PhoneSignInDto
  ) {
    await toNodeHandler(this.authenticationService.betterAuth)(req, res)
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
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
