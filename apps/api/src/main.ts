import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { ConfigService } from './config/config.service'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

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
