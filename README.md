# Circuit Breaker for NestJS

### Before installation

To install this package, run the following commands:

## Installation

```bash in pnpm
$ pnpm add --save-prod circuit-breaker-nestjs
```

```bash in npm
$ npm install --save-prod circuit-breaker-nestjs
```

## Getting started

You can use the `CircuitBreakerInterceptor` interceptor with the `useGlobalInterceptors` interceptor in the `main.ts`
file to add a circuit breaker to all controllers:

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CircuitBreakerInterceptor } from 'circuit-breaker-nestjs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(new CircuitBreakerInterceptor())
  await app.listen(3000)
}
```

Or you can use the `CircuitBreakerInterceptor` interceptor with the `useInterceptors` interceptor in the controller (for
one controller):

```ts
import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { CircuitBreakerInterceptor } from 'circuit-breaker-nestjs'

@Controller()
@UseInterceptors(CircuitBreakerInterceptor)
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!'
  }
}
```

Or you can use the `CircuitBreakerInterceptor` interceptor with the `useInterceptors` interceptor in the controller (for
one route):

```ts
import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { CircuitBreakerInterceptor } from 'circuit-breaker-nestjs'

@Controller()
export class AppController {
  @Get()
  @UseInterceptors(CircuitBreakerInterceptor)
  getHello(): string {
    return 'Hello World!'
  }
}
```

Or you can use the `CircuitBreakerInterceptor` more flexible version interceptor with the `useInterceptors` interceptor
in `main.ts` file:

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CircuitBreakerInterceptor } from 'circuit-breaker-nestjs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(
    new CircuitBreakerInterceptor({
      failureThresholdPercentage: 50, // default 50
      halfOpenThresholdPercentage: 60, // default 50
      halfOpenRequestCount: 12, // default 10
      rangeTime: 10000, // default 60000 (1 minute)
      timeout: 50000, // default 5000 (5 seconds)
    }),
  )
  await app.listen(3000)
}
```

Or you can use the `CircuitBreakerInterceptor`interceptor for manually close service with the `useInterceptors`
interceptor in `main.ts` file:

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CircuitBreakerInterceptor, CircuitBreakerState } from 'circuit-breaker-nestjs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(
    new CircuitBreakerInterceptor({
      manual: true,
      manualState: CircuitBreakerState.OPEN,
    }),
  )
  await app.listen(3000)
}
```

## Options

| Option                      | Type                | Default                    | Description                                                                                                     |
| --------------------------- | ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| failureThresholdPercentage  | number              | 50                         | The percentage of failed requests that will trip the circuit into the OPEN state.                               |
| halfOpenThresholdPercentage | number              | 50                         | The percentage of requests that must succeed in the HALF_OPEN state.                                            |
| halfOpenRequestCount        | number              | 10                         | The number of requests that can go inside service for changing state to other state in the HALF_OPEN state.     |
| timeout                     | number              | 5000                       | The time in milliseconds that the circuit breaker should wait before changing the state from OPEN to HALF_OPEN. |
| rangeTime                   | number              | 60000                      | The time in milliseconds that the circuit breaker check failures.                                               |
| manual                      | boolean             | false                      | The manual mode for circuit breaker.                                                                            |
| manualState                 | CircuitBreakerState | CircuitBreakerState.CLOSED | The manual state for circuit breaker.                                                                           |

## License

Nest is [MIT licensed](LICENSE).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers.

## Stay in touch

- Author - [Habibov Ulugbek]
- Email - [habibovulugbek22@gmail.com]

Enjoy!
