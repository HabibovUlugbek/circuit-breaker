import { Injectable } from "@nestjs/common";
import { CircuitBreakerState } from "@enums";
import type { CircuitBreakerOptions } from "@interfaces";

@Injectable()
export class CircuitBreakerService {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures = 0;
  private nextAttempt = 0;
  private checkStart: number;
  private requestCount = 0;

  private readonly failureThresholdPercentage: number;
  private readonly halfOpenThresholdPercentage: number;
  private readonly rangeTime: number;
  private readonly timeout: number;

  constructor(options: CircuitBreakerOptions) {
    this.failureThresholdPercentage = options.failureThresholdPercentage;
    this.halfOpenThresholdPercentage = options.halfOpenThresholdPercentage;
    this.rangeTime = options.rangeTime;
    this.timeout = options.timeout;
  }

  canCall(): boolean {
    switch (this.state) {
      case CircuitBreakerState.CLOSED:
        return true;
      case CircuitBreakerState.OPEN:
        if (Date.now() >= this.nextAttempt) {
          this.state = CircuitBreakerState.HALF_OPEN;
          return true;
        }
        return false;
      case CircuitBreakerState.HALF_OPEN:
        if (
          this.requestCount > 10 &&
          this.calculateFailurePercentage() > this.halfOpenThresholdPercentage
        ) {
          this.state = CircuitBreakerState.OPEN;
          this.nextAttempt = Date.now() + this.timeout;
          this.failures = 0;
          this.requestCount = 0;
          return false;
        } else return true;
    }
  }

  changeState() {
    if (this.calculateFailurePercentage() > this.failureThresholdPercentage) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      this.failures = 0;
      this.requestCount = 0;
    } else {
      this.reset();
    }
  }

  recordRequest() {
    console.log("recordRequest");
    console.log("this.requestCount", this.requestCount);
    console.log("this.checkStart", this.checkStart);
    console.log("this.rangeTime", this.rangeTime);
    console.log("this.failures", this.failures);
    this.requestCount += 1;
    if (this.requestCount === 1) {
      this.checkStart = Date.now();
    }

    const now = Date.now();
    const timePassed = now - this.checkStart;
    if (timePassed > this.rangeTime) {
      console.log("timePassed > this.rangeTime");
      this.changeState();
    }
  }

  recordFailure() {
    this.failures += 1;
  }

  calculateFailurePercentage(): number {
    return (this.failures / this.requestCount) * 100;
  }

  reset() {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = 0;
    this.nextAttempt = 0;
    this.requestCount = 0;
  }
}
