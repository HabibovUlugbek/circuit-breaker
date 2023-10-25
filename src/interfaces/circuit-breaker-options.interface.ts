export declare interface CircuitBreakerOptions {
  failureThresholdPercentage: number;
  halfOpenThresholdPercentage: number;
  rangeTime: number;
  timeout: number;
  statusCodes?: number[];
}
