import { IsOptional, IsString } from 'class-validator'

export class UpdateParcelRequestDto {
  @IsOptional()
  @IsString()
  source?: string | null

  @IsOptional()
  @IsString()
  description?: string | null
}
