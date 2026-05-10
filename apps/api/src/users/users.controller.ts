import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ILike, Raw } from 'typeorm'

import { GetUserResponseDto } from './dtos/get-user-response.dto'
import { GetUsersQueryDto } from './dtos/get-users-query.dto'
import { UsersMapper } from './users.mapper'
import { UsersPolicy } from './users.policy'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersPolicy: UsersPolicy,
    private readonly usersService: UsersService
  ) {}

  @Get(':userId')
  async getUser(
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<GetUserResponseDto> {
    await this.usersPolicy.checkCanRead(userId)

    const user = await this.usersService.findOneOrThrow({
      where: { id: userId },
    })

    return UsersMapper.toGetUserResponseDto(user)
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
          {
            ...baseWhere,
            clientId: Raw((alias) => `CAST(${alias} AS text) ILIKE :search`, {
              search: `%${search}%`,
            }),
          },
        ]
      : baseWhere

    const users = await this.usersService.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return users.map((user) => UsersMapper.toGetUserResponseDto(user))
  }
}
