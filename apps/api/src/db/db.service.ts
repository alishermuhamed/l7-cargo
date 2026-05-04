import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class DbService implements OnModuleInit {
  private readonly logger = new Logger(DbService.name)

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      const migrations = await this.dataSource.runMigrations({
        transaction: 'all',
      })

      if (migrations.length === 0) {
        this.logger.log('No migrations to execute')
        return
      }

      this.logger.log(
        `Database migrations executed successfully: ${migrations.map((m) => m.name).join(', ')}`
      )
    } catch (error) {
      this.logger.error('Error during migration execution')
      throw error
    }
  }
}
