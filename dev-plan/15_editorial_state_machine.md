# 15 Editorial State Machine

Source sections: 3.3, 35.1.
Atomic aspect: publish-state transitions only.
Prerequisite: step 14.
Implement: DRAFT/SCHEDULED/PUBLISHED/ARCHIVED transitions with audit events and guardrails.
Deliverable: editorial lifecycle service.
Verify: invalid transitions fail; valid transitions are persisted and logged.
