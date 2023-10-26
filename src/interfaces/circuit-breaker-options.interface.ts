export declare interface CircuitBreakerOptions {
  failureThresholdPercentage: number
  halfOpenThresholdPercentage: number
  halfOpenRequestCount?: number
  rangeTime: number
  timeout: number
  statusCodes?: number[]
}
