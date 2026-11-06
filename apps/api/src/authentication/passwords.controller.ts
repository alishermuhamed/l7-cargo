import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common'
import type { Request } from 'express'

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { UsersPolicy } from '../users/users.policy'
import { AuthenticationService } from './authentication.service'
import { SetPasswordDto } from './dtos/set-password.dto'
import { TemporaryPasswordResponseDto } from './dtos/temporary-password-response.dto'

@Controller('auth')
export class PasswordsController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersPolicy: UsersPolicy
  ) {}

  @Post('users/:userId/temporary-password')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  async issueTemporaryPassword(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<TemporaryPasswordResponseDto> {
    this.usersPolicy.checkCanIssueTemporaryPassword()
    return {
      temporaryPassword:
        await this.authenticationService.issueTemporaryPassword(userId),
    }
  }

  @Post('change-temporary-password')
  @HttpCode(HttpStatus.OK)
  async changeTemporaryPassword(
    @Req() req: Request,
    @Body() body: SetPasswordDto
  ): Promise<SuccessResponseDto> {
    await this.authenticationService.changeTemporaryPassword(
      body.newPassword,
      req.headers
    )
    return new SuccessResponseDto()
  }
}
