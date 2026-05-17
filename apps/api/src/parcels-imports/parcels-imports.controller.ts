import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes } from '@nestjs/swagger'

import { SuccessResponseDto } from '../common/dtos/success-response.dto'
import { CreateParcelsImportRequestDto } from './dtos/create-parcels-import-request.dto'
import { CreateParcelsImportResponseDto } from './dtos/create-parcels-import-response.dto'
import { GetParcelsImportResponseDto } from './dtos/get-parcels-import-response.dto'
import { GetParcelsImportSummaryResponseDto } from './dtos/get-parcels-import-summary-response.dto'
import { GetParcelsImportsQueryDto } from './dtos/get-parcels-imports-query.dto'
import { ParcelsImportsMapper } from './parcels-imports.mapper'
import { ParcelsImportsPolicy } from './parcels-imports.policy'
import { ParcelsImportsService } from './parcels-imports.service'

const MAX_IMPORT_FILE_SIZE = 1 * 1024 * 1024 + 1 // 1 MB
const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const PARCELS_IMPORT_ID_PARAM = 'parcelsImportId'

@Controller('parcels-imports')
export class ParcelsImportsController {
  constructor(
    private readonly parcelsImportsPolicy: ParcelsImportsPolicy,
    private readonly parcelsImportsService: ParcelsImportsService
  ) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateParcelsImportRequestDto })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createParcelsImport(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMPORT_FILE_SIZE }),
          new FileTypeValidator({ fileType: XLSX_MIME_TYPE }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body()
    { withHeader, parcelStatus }: CreateParcelsImportRequestDto
  ): Promise<CreateParcelsImportResponseDto> {
    this.parcelsImportsPolicy.checkCanCreate()

    if (!file) {
      throw new BadRequestException()
    }

    const id = await this.parcelsImportsService.create({
      file,
      withHeader: withHeader === 'true',
      parcelStatus,
    })

    return ParcelsImportsMapper.toCreateParcelsImportResponseDto(id)
  }

  @Get()
  async getParcelsImports(
    @Query() { limit, offset }: GetParcelsImportsQueryDto
  ): Promise<GetParcelsImportSummaryResponseDto[]> {
    this.parcelsImportsPolicy.checkCanList()

    const parcelsImports = await this.parcelsImportsService.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })

    return parcelsImports.map((parcelsImport) =>
      ParcelsImportsMapper.toGetParcelsImportSummaryResponseDto(parcelsImport)
    )
  }

  @Post(`:${PARCELS_IMPORT_ID_PARAM}`)
  async commitParcelsImport(
    @Param(PARCELS_IMPORT_ID_PARAM, ParseUUIDPipe) parcelsImportId: string
  ): Promise<SuccessResponseDto> {
    await this.parcelsImportsPolicy.checkCanCommit(parcelsImportId)

    await this.parcelsImportsService.commit(parcelsImportId)

    return new SuccessResponseDto()
  }

  @Get(`:${PARCELS_IMPORT_ID_PARAM}`)
  async getParcelsImport(
    @Param(PARCELS_IMPORT_ID_PARAM, ParseUUIDPipe) parcelsImportId: string
  ): Promise<GetParcelsImportResponseDto> {
    await this.parcelsImportsPolicy.checkCanRead(parcelsImportId)

    const parcelsImport = await this.parcelsImportsService.findOneOrThrow({
      where: { id: parcelsImportId },
    })

    return ParcelsImportsMapper.toGetParcelsImportResponseDto(parcelsImport)
  }

  @Delete(`:${PARCELS_IMPORT_ID_PARAM}`)
  async deleteParcelsImport(
    @Param(PARCELS_IMPORT_ID_PARAM, ParseUUIDPipe) parcelsImportId: string
  ): Promise<SuccessResponseDto> {
    await this.parcelsImportsPolicy.checkCanDelete(parcelsImportId)

    await this.parcelsImportsService.delete(parcelsImportId)

    return new SuccessResponseDto()
  }
}
