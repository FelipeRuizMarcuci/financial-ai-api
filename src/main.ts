import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Financial AI Api')
    .setDescription('The Financial AI Api')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Signup')
    .addTag('Dashboard')
    .addTag('Transactions')
    .addTag('Goals')
    .addTag('Reports')
    .addTag('Users')
    .addTag('Config')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(process.env.PORT || 3000);
  console.log(
    `🚀 Application is running on: http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
  );
}
bootstrap();
