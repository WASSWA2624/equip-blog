# 16 Scheduled Publishing Worker

Source sections: 3.3, 35.2.
Atomic aspect: schedule executor only.
Prerequisite: step 15.
Implement: queue-based scheduler for publish-at datetime with retries and idempotency locks.
Deliverable: scheduled publish worker.
Verify: scheduled posts publish once at expected time within tolerance window.
