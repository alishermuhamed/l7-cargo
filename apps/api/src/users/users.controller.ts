import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ILike } from 'typeorm'

import { AuthenticationService } from '../authentication/authentication.service'
import { AllowUnresolvedClient } from '../clients/decorators/allow-unresolved-client.decorator'
import { GetUserDetailsResponseDto } from './dtos/get-user-details-response.dto'
import { GetUserResponseDto } from './dtos/get-user-response.dto'
import { GetUsersQueryDto } from './dtos/get-users-query.dto'
import { UsersMapper } from './users.mapper'
import { UsersPolicy } from './users.policy'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersPolicy: UsersPolicy,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService
  ) {}

  @AllowUnresolvedClient()
  @Get(':userId')
  async getUser(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<GetUserDetailsResponseDto> {
    await this.usersPolicy.checkCanRead(userId)

    const user = await this.usersService.findOneOrThrow({
      where: { id: userId },
      relations: { client: true },
    })

    return {
      ...UsersMapper.toGetUserResponseDto(user),
      hasPassword:
        await this.authenticationService.hasPasswordForUserId(userId),
    }
  }

  @Get()
  async getUsers(
    @Query() { search, role, limit, offset }: GetUsersQueryDto
  ): Promise<GetUserResponseDto[]> {
    this.usersPolicy.checkCanList()

    const baseWhere = { role }

    const where = search
      ? [
          { ...baseWhere, name: ILike(`%${search}%`) },
          { ...baseWhere, phoneNumber: ILike(`%${search}%`) },
        ]
      : baseWhere

    const users = await this.usersService.find({
      where,
      relations: { client: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return users.map((user) => UsersMapper.toGetUserResponseDto(user))
  }
}
