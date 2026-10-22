import { IsInt, Max, Min, NotEquals } from 'class-validator'

import { INT32_MAX, INT32_MIN } from '../../common/integer.constants'

export class UpdateClientCodeRequestDto {
  @IsInt()
  @Min(1)
  @Max(INT32_MAX)
  code!: number

  @IsInt()
  @Min(INT32_MIN)
  @Max(INT32_MAX)
  @NotEquals(0)
  expectedCode!: number
}
