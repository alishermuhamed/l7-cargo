import { IsOptional, IsString, Matches, MinLength } from 'class-validator'

import { IsMoneyString } from '../../common/money'

const WEIGHT_KG_PATTERN = /^(?:0|[1-9]\d{0,3})(?:\.\d{1,3})?$/

export class CreateParcelRequestDto {
  @IsString()
  @MinLength(1)
  @Matches(/\S/)
  trackingNumber!: string

  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  @Matches(WEIGHT_KG_PATTERN)
  weightKg?: string

  @IsOptional()
  @IsMoneyString()
  deliveryFee?: string
}
