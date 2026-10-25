import { IsInt, Max, Min } from 'class-validator'

import { INT32_MAX } from '../../common/integer.constants'

export class AddClientAliasRequestDto {
  @IsInt()
  @Min(1)
  @Max(INT32_MAX)
  code!: number
}
