import { Injectable } from '@nestjs/common'
import { CircuitBreakerState } from '@enums'
import type { CircuitBreakerOptions } from '@interfaces'
import {
  FAILURE_THRESHOLD_PERCENTAGE,
  HALF_OPEN_THRESHOLD_PERCENTAGE,
  HALF_OPEN_REQUEST_COUNT,
  RANGE_TIME,
  TIMEOUT,
  MANUAL,
  MANUAL_STATE,
} from '@constants'

@Injectable()
export class CircuitBreakerService {
  #_state: CircuitBreakerState = CircuitBreakerState.CLOSED
  #_failures = 0
  #_nextAttempt = 0
  #_requestCount = 0
  #_checkStart: number = Date.now()

  readonly #_manualState: CircuitBreakerState.CLOSED | CircuitBreakerState.OPEN
  readonly #_failureThresholdPercentage: number
  readonly #_halfOpenThresholdPercentage: number
  readonly #_halfOpenRequestCount: number
  readonly #_rangeTime: number
  readonly #_timeout: number
  readonly #_manual: boolean

  constructor(options: CircuitBreakerOptions) {
    this.#_failureThresholdPercentage = options?.failureThresholdPercentage ?? FAILURE_THRESHOLD_PERCENTAGE
    this.#_halfOpenThresholdPercentage = options?.halfOpenThresholdPercentage ?? HALF_OPEN_THRESHOLD_PERCENTAGE
    this.#_halfOpenRequestCount = options?.halfOpenRequestCount ?? HALF_OPEN_REQUEST_COUNT
    this.#_rangeTime = options?.rangeTime ?? RANGE_TIME
    this.#_timeout = options?.timeout ?? TIMEOUT
    this.#_manual = options?.manual ?? MANUAL
    this.#_manualState = options?.manualState ?? MANUAL_STATE
  }

  canCall(): boolean {
    if (!this.#_manual) {
      switch (this.#_state) {
        case CircuitBreakerState.CLOSED:
          return true
        case CircuitBreakerState.OPEN:
          if (Date.now() >= this.#_nextAttempt) {
            this.#_requestCount = 0
            this.#_failures = 0
            this.#_changeState(CircuitBreakerState.HALF_OPEN)
            return true
          }
          return false
        case CircuitBreakerState.HALF_OPEN:
          if (this.#_requestCount < this.#_halfOpenRequestCount) {
            return true
          }

          if (this.#_requestCount >= this.#_halfOpenRequestCount) {
            if (100 - this.#_calculateFailurePercentage() >= this.#_halfOpenThresholdPercentage) {
              this.#_changeState(CircuitBreakerState.CLOSED)
              return false
            } else {
              this.#_changeState(CircuitBreakerState.OPEN)
              return true
            }
          }
      }
    } else {
      switch (this.#_manualState) {
        case CircuitBreakerState.CLOSED:
          return true
        case CircuitBreakerState.OPEN:
          return false
      }
    }
  }

  recordRequest() {
    const now = Date.now()
    const timePassed = now - this.#_checkStart

    if (this.#_state === CircuitBreakerState.CLOSED) {
      if (timePassed > this.#_rangeTime && timePassed < this.#_rangeTime * 1.2) {
        if (this.#_calculateFailurePercentage() > this.#_failureThresholdPercentage) {
          this.#_changeState(CircuitBreakerState.OPEN)
        } else {
          this.#_reset()
        }
      } else if (timePassed > this.#_rangeTime * 1.2) {
        this.#_reset()
      }
    }

    this.#_requestCount += 1
    if (this.#_requestCount === 1) {
      this.#_checkStart = Date.now()
    }
  }

  recordFailure() {
    this.#_failures += 1
  }

  #_changeState(state: CircuitBreakerState) {
    console.log('==================================== State Changed ====================================')
    console.log('Changing State ' + 'from ' + this.#_state + ' to ' + state)
    console.log('RequestCount : ', this.#_requestCount)
    console.log('Failures :', this.#_failures)
    console.log('FailurePercentage :', this.#_calculateFailurePercentage() + '%')
    console.log('=======================================================================================')

    this.#_state = state
    this.#_requestCount = 0
    this.#_failures = 0
    switch (state) {
      case CircuitBreakerState.CLOSED:
        this.#_nextAttempt = 0
        break
      case CircuitBreakerState.OPEN:
        this.#_nextAttempt = Date.now() + this.#_timeout
        break
      case CircuitBreakerState.HALF_OPEN:
        this.#_nextAttempt = 0
        this.#_checkStart = Date.now()
        break
    }
  }

  #_calculateFailurePercentage(): number {
    if (this.#_requestCount === 0) return 0
    return (this.#_failures / this.#_requestCount) * 100
  }

  #_reset() {
    console.log('==================================== State Reset to Closed ====================================')
    console.log('State reset ' + 'to ' + CircuitBreakerState.CLOSED)
    console.log('RequestCount : ', this.#_requestCount)
    console.log('Start Time : ', new Date(this.#_checkStart).toLocaleTimeString())
    console.log('End Time : ', new Date(Date.now()).toLocaleTimeString())
    console.log('=======================================================================================')
    this.#_state = CircuitBreakerState.CLOSED
    this.#_failures = 0
    this.#_nextAttempt = 0
    this.#_requestCount = 0
    this.#_checkStart = Date.now()
  }
}
