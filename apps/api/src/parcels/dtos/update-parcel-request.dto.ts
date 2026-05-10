import { IsOptional, IsString, Matches } from 'class-validator'

import { IsMoneyString } from '../../common/money'

const WEIGHT_KG_PATTERN = /^(?:0|[1-9]\d{0,3})(?:\.\d{1,3})?$/

export class UpdateParcelRequestDto {
  @IsOptional()
  @IsString()
  source?: string | null

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsString()
  @Matches(WEIGHT_KG_PATTERN)
  weightKg?: string | null

  @IsOptional()
  @IsMoneyString()
  deliveryFee?: string | null
}
