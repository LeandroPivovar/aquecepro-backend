import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    'http://aquecepro.online',
    'https://aquecepro.online',
    'http://www.aquecepro.online',
    'https://www.aquecepro.online',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Em desenvolvimento, permite todas as origens locais
      if (process.env.NODE_ENV !== 'production') {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
      }
      
      // Em produção, verifica se está na lista permitida ou é do domínio aquecepro.online
      if (!origin) {
        // Permite requisições sem origin (mobile apps, Postman, etc)
        callback(null, true);
      } else if (
        allowedOrigins.includes(origin) ||
        origin.includes('aquecepro.online')
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS bloqueado para origem: ${origin}`);
        callback(new Error('Não permitido pelo CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prefixo global para todas as rotas
  // Em produção, o Nginx já faz o stripping do prefixo /api, então não o usamos aqui
  if (process.env.NODE_ENV !== 'production') {
    app.setGlobalPrefix('api');
  }

  // Middleware para logar todas as requisições (ajuda no debug de 404)
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('AquecePro API')
    .setDescription('API para o sistema de gestão AquecePro')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = process.env.NODE_ENV === 'production' ? 'docs' : 'api/docs';
  SwaggerModule.setup(swaggerPath, app, document);

  const port = process.env.PORT || 3020;
  await app.listen(port);
  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/${swaggerPath}`);
}

bootstrap();

