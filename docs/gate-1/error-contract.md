# Error Contract — Aquarist Phase 1

## Standard error envelope

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "status": 422,
    "request_id": "req_123",
    "retryable": false,
    "details": [
      {
        "field": "measurements[0].parameter_code",
        "issue": "unsupported_for_tank_class",
        "value": "salinity_sg"
      }
    ]
  }
}
```

## Required fields

- `code`: stable machine-readable code
- `message`: short human-readable message
- `status`: HTTP status
- `request_id`: per-request trace ID
- `retryable`: boolean
- `details[]`: optional structured issues

## HTTP status usage

- `400` malformed JSON / invalid structure
- `401` missing or invalid auth
- `403` authenticated but not allowed
- `404` resource not found or not visible
- `409` state conflict
- `422` field/domain validation failure
- `428` required acknowledgment or precondition missing
- `429` rate limited
- `500` unexpected server failure
- `503` dependency unavailable / service degraded

## Canonical error codes

### Authentication / authorization
- `AUTH_REQUIRED`
- `AUTH_INVALID`
- `FORBIDDEN`

### Resource / visibility
- `RESOURCE_NOT_FOUND`
- `RESOURCE_ARCHIVED`

### Validation
- `VALIDATION_FAILED`
- `INVALID_LOCALE`
- `UNSUPPORTED_PARAMETER_FOR_TANK_CLASS`
- `INVALID_THRESHOLD_RANGE`
- `INVALID_RECURRENCE`

### State conflicts
- `TANK_CLASS_CHANGE_CONFLICT`
- `COMPATIBILITY_BLOCK`
- `ALERT_ALREADY_ACKNOWLEDGED`
- `TASK_ALREADY_COMPLETED`

### Preconditions
- `COMPATIBILITY_ACK_REQUIRED`
- `UNSUPPORTED_SPECIES_ACK_REQUIRED`

### Platform / infra
- `RATE_LIMITED`
- `SERVICE_UNAVAILABLE`
- `INTERNAL_ERROR`

## Error behavior by scenario

### Add livestock with blocker result
- HTTP `409`
- `code = COMPATIBILITY_BLOCK`

### Add livestock with caution but no acknowledgment
- HTTP `428`
- `code = COMPATIBILITY_ACK_REQUIRED`

### Add searchable-only species without acknowledgment
- HTTP `428`
- `code = UNSUPPORTED_SPECIES_ACK_REQUIRED`

### Search excluded species by ID
- HTTP `404`
- `code = RESOURCE_NOT_FOUND`

### Compatibility request with missing tank thresholds
- HTTP `200`
- not an error
- result payload uses `result_class = unknown`

Missing compatibility data is a domain result, not a transport failure.
