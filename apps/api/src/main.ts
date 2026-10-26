import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { ConfigService } from './config/config.service'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = app.get(ConfigService)

  if (configService.get('env.isRender')) {
    // Trust the nearest proxy; ignore client-supplied prefixes in X-Forwarded-For.
    app.set('trust proxy', 1)
  }

  const webUrl = configService.get('web.url')

  if (webUrl) {
    app.enableCors({
      origin: webUrl,
      credentials: true,
    })
  }

  const documentFactory = () =>
    SwaggerModule.createDocument(app, new DocumentBuilder().build(), {
      operationIdFactory: (_, methodKey) => methodKey,
    })

  SwaggerModule.setup('swagger', app, documentFactory)

  const port = configService.getOrThrow('env.port')
  await app.listen(port)
}

void bootstrap()
