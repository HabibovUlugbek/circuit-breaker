import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { CircuitBreakerService } from "@services";
import type { CircuitBreakerOptions } from "@interfaces";

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  readonly #_circuitBreaker: CircuitBreakerService;
  readonly #_statusCodes: number[];

  constructor(options: CircuitBreakerOptions) {
    this.#_circuitBreaker = new CircuitBreakerService({
      failureThresholdPercentage: options.failureThresholdPercentage,
      halfOpenThresholdPercentage: options.halfOpenThresholdPercentage,
      rangeTime: options.rangeTime,
      timeout: options.timeout,
    });
    this.#_statusCodes = options.statusCodes;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();

    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    console.log("request", request);
    console.log("response", response);

    if (!this.#_circuitBreaker.canCall()) {
      throw new HttpException(
        "Service temporarily unavailable",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    this.#_circuitBreaker.recordRequest();

    return next.handle().pipe(
      catchError((error) => {
        if (!this.#_circuitBreaker.canCall()) {
          throw new HttpException(
            "Service temporarily unavailable,",
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }

        if (
          this.#_statusCodes.length > 0 &&
          this.#_statusCodes.includes(error.status)
        ) {
          this.#_circuitBreaker.recordFailure();
        } else if (error.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
          this.#_circuitBreaker.recordFailure();
        }

        return throwError(error); // Pass the error downstream
      })
    );
  }
}
