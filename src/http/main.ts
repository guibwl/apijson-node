import { NestFactory } from '@nestjs/core'
import { ApplicationModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { MyLogger, logger } from './logger.middleware';
 
async function bootstrap(port = 3010) {
  const appOptions = {
    cors: true,
    logger: new MyLogger(),
  }
  const app = await NestFactory.create(ApplicationModule, appOptions)

  const options = new DocumentBuilder()
    .setTitle('AI-APIJSON-NODE')
    .setDescription('APIJSON node版本')
    .setVersion('0.0.1')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/docs', app, document)

  app.use(logger);
  await app.listen(port)
}
bootstrap()