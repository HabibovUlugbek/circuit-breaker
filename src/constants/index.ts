import { CircuitBreakerState } from '@enums'

export const FAILURE_THRESHOLD_PERCENTAGE = 50
export const HALF_OPEN_THRESHOLD_PERCENTAGE = 50
export const HALF_OPEN_REQUEST_COUNT = 10
export const RANGE_TIME = 60000
export const TIMEOUT = 10000
export const MANUAL = false
export const MANUAL_STATE = CircuitBreakerState.CLOSED
