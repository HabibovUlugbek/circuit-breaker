# Circuit Breaker for NestJS

### Before installation

To install this package, run the following commands:

## Installation

```bash
$ pnpm add --save-prod @habibovulugbek/nest-circuit-breaker
```

If you want to use the `RpcExceptionFilter`, `ExpressExceptionFilter` or `FastifyExceptionFilter` filter with the
`ExceptionInterceptor` interceptor, you must install additional packages:

```bash
$ pnpm add --save-prod @nestjs/common reflect-metadata rxjs
```

## Getting started

You can use the `RpcExceptionFilter` filter with the `ExceptionInterceptor` interceptor in the `main.ts` file to handle
all exceptions in the rpc application:

```ts
// main.ts
import type { NatsOptions } from '@nestjs/microservices'
import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { RpcExceptionFilter, ExceptionInterceptor } from '@sello-lab/exceptions'
import { AppModule } from './app.module'

setImmediate(async (): Promise<void> => {
  const app = await NestFactory.createMicroservice<NatsOptions>(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: ['nats://127.0.0.1:4222'],
    },
  })

  app.useGlobalFilters(new RpcExceptionFilter())
  app.useGlobalInterceptors(new ExceptionInterceptor())

  await app.listen()
})
```

You can use the `ExpressExceptionFilter` filter with the `ExceptionInterceptor` interceptor in the `main.ts` file to
handle all exceptions in the express application:

```ts
// main.ts
import type { NestExpressApplication } from '@nestjs/platform-express'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ExpressExceptionFilter, ExceptionInterceptor } from '@sello-lab/exceptions'
import { AppModule } from './app.module'

setImmediate(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter())

  app.useGlobalFilters(new ExpressExceptionFilter())
  app.useGlobalInterceptors(new ExceptionInterceptor())

  await app.listen(3000, '127.0.0.1')
})
```

You can use the `FastifyExceptionFilter` filter with the `ExceptionInterceptor` interceptor in the `main.ts` file to
handle all exceptions in the fastify application:

```ts
// main.ts
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { FastifyExceptionFilter, ExceptionInterceptor } from '@sello-lab/exceptions'
import { AppModule } from './app.module'

setImmediate(async (): Promise<void> => {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  app.useGlobalFilters(new FastifyExceptionFilter())
  app.useGlobalInterceptors(new ExceptionInterceptor())

  await app.listen(3000, '127.0.0.1')
})
```

There are **11 exceptions** in this package. You can use them in your project.

Enjoy!
