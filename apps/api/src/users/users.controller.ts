import { Controller, Get, Query } from '@nestjs/common'
import { ILike } from 'typeorm'

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
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return users.map((user) => UsersMapper.toGetUserResponseDto(user))
  }
}
