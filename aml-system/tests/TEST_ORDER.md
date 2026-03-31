
## `tests/TEST_ORDER.md`

```md
# Phase 7 Test Execution Order

To keep results organized and reproducible, Phase 7 should run in this order:

1. **Functional tests**
2. **Integration and end-to-end tests**
3. **Compliance validation tests**
4. **Performance tests**
5. **Evidence collation for report/demo**

## Why this order matters

### 1. Functional tests first

Functional tests confirm basic correctness of individual components before service chaining begins.

### 2. Integration and E2E tests second

Once individual components are stable, end-to-end service interaction can be validated with confidence.

### 3. Compliance validation third

Compliance assertions should only be validated against a system that is already behaving correctly.

### 4. Performance tests fourth

Performance measurements are only meaningful after correctness is stable.

### 5. Evidence collation last

The final step is to organize:

- logs,
- screenshots,
- endpoint responses,
- database snapshots,
- benchmark summaries,
- and compliance results

for the report, defense, and demo.

## Execution map

```text
1. HE functional tests
2. SMPC functional tests
3. zk proof generation / verification tests
4. API end-to-end tests
5. Compliance proof tests
6. Compliance validation scripts
7. Performance load tests
8. Phase 7 evidence collation