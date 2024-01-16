import { CircuitBreakerState } from '@enums'

export declare interface CircuitBreakerOptions {
  failureThresholdPercentage?: number
  halfOpenThresholdPercentage?: number
  halfOpenRequestCount?: number
  rangeTime?: number
  timeout?: number
  statusCodes?: number[]
  manual?: boolean
  manualState?: CircuitBreakerState.CLOSED | CircuitBreakerState.OPEN
}
