# 05 Database Indexes and Seeds

Source sections: 13, 31, 33.
Atomic aspect: indexing/seed only.
Prerequisite: step 04.
Implement: indexes for high-read paths and append-only analytics access; seed admin, base locales, provider defaults.
Deliverable: idempotent seed and index migration.
Verify: repeated seed runs remain duplicate-free and key queries use indexes.
