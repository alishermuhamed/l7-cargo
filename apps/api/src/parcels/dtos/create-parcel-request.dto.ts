import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateParcelRequestDto {
  @IsString()
  @MinLength(1)
  trackingNumber!: string

  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @IsString()
  description?: string
}
