import { Injectable } from '@nestjs/common'
import { CircuitBreakerState } from '@enums'
import type { CircuitBreakerOptions } from '@interfaces'

@Injectable()
export class CircuitBreakerService {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED
  private failures = 0
  private nextAttempt = 0
  private checkStart: number
  private requestCount = 0
  private readonly manualState: CircuitBreakerState

  private readonly failureThresholdPercentage: number
  private readonly halfOpenThresholdPercentage: number
  private readonly halfOpenRequestCount: number = 10
  private readonly rangeTime: number
  private readonly timeout: number
  private readonly manual: boolean = false

  constructor(options: CircuitBreakerOptions) {
    this.failureThresholdPercentage = options.failureThresholdPercentage
    this.halfOpenThresholdPercentage = options.halfOpenThresholdPercentage
    this.halfOpenRequestCount = options?.halfOpenRequestCount
    this.rangeTime = options.rangeTime
    this.timeout = options.timeout
    this.manual = options.manual
    this.manualState = options.manualState
  }

  canCall(): boolean {
    if (!this.manual) {
      switch (this.state) {
        case CircuitBreakerState.CLOSED:
          return true
        case CircuitBreakerState.OPEN:
          if (Date.now() >= this.nextAttempt) {
            this.state = CircuitBreakerState.HALF_OPEN
            return true
          }
          return false
        case CircuitBreakerState.HALF_OPEN:
          if (
            this.requestCount >= this.halfOpenRequestCount &&
            this.calculateFailurePercentage() > this.halfOpenThresholdPercentage
          ) {
            this.state = CircuitBreakerState.OPEN
            this.nextAttempt = Date.now() + this.timeout
            this.failures = 0
            this.requestCount = 0
            return false
          } else return true
      }
    } else {
      switch (this.manualState) {
        case CircuitBreakerState.CLOSED:
          return true
        case CircuitBreakerState.OPEN:
          return false
      }
    }
  }

  changeState() {
    console.log('RequestCount : ', this.requestCount)
    console.log('Failures :', this.failures)
    console.log('FailurePercentage :', this.calculateFailurePercentage())
    console.log('State :', this.state)
    if (this.calculateFailurePercentage() > this.failureThresholdPercentage) {
      this.state = CircuitBreakerState.OPEN
      this.nextAttempt = Date.now() + this.timeout
      this.failures = 0
      this.requestCount = 0
    } else {
      this.reset()
    }
  }

  recordRequest() {
    const now = Date.now()
    const timePassed = now - this.checkStart

    if (timePassed > this.rangeTime && timePassed < this.rangeTime * 1.5) {
      this.changeState()
    } else if (timePassed > 1.5 * this.rangeTime) {
      this.reset()
    }

    this.requestCount += 1
    if (this.requestCount === 1) {
      this.checkStart = Date.now()
    }
  }

  recordFailure() {
    this.failures += 1
  }

  calculateFailurePercentage(): number {
    return (this.failures / this.requestCount) * 100
  }

  reset() {
    this.state = CircuitBreakerState.CLOSED
    this.failures = 0
    this.nextAttempt = 0
    this.requestCount = 0
  }
}
