import { config } from 'dotenv'
import { DataSource } from 'typeorm'

import { envConfig } from '../config/env-config'
import { buildDataSourceOptions } from './data-source-options'

config()

const { database } = envConfig()
const dataSource = new DataSource(buildDataSourceOptions(database))

export default dataSource
