import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { CircuitBreakerService } from '@services'
import type { CircuitBreakerOptions } from '@interfaces'

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  readonly #_circuitBreaker: CircuitBreakerService
  readonly #_statusCodes: number[]

  constructor(options: CircuitBreakerOptions) {
    this.#_circuitBreaker = new CircuitBreakerService({
      failureThresholdPercentage: options.failureThresholdPercentage,
      halfOpenThresholdPercentage: options.halfOpenThresholdPercentage,
      halfOpenRequestCount: options.halfOpenRequestCount,
      rangeTime: options.rangeTime,
      timeout: options.timeout,
      manual: options.manual,
      manualState: options.manualState,
    })
    this.#_statusCodes = options.statusCodes
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.#_circuitBreaker.canCall()) {
      throw new HttpException('Service temporarily unavailable', HttpStatus.SERVICE_UNAVAILABLE)
    }

    this.#_circuitBreaker.recordRequest()

    return next.handle().pipe(
      catchError((error) => {
        if (!this.#_circuitBreaker.canCall()) {
          throw new HttpException('Service temporarily unavailable,', HttpStatus.SERVICE_UNAVAILABLE)
        }
        const status = error.getStatus()

        if (this.#_statusCodes && this.#_statusCodes.length > 0 && this.#_statusCodes.includes(status)) {
          this.#_circuitBreaker.recordFailure()
        } else if (
          (!this.#_statusCodes || this.#_statusCodes.length === 0) &&
          status >= HttpStatus.INTERNAL_SERVER_ERROR
        ) {
          this.#_circuitBreaker.recordFailure()
        }

        return throwError(error) // Pass the error downstream
      }),
    )
  }
}
