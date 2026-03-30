# GDPR-Oriented Controls

## Controls implemented in the prototype
- deterministic pseudonymization for sender and receiver identifiers
- reduced exposure of raw transaction data in downstream services
- audit-layer storage focused on metadata and event linkage
- proof generation over sanitized claim artifacts

## Controls configured
- raw identifier storage disabled in standard processing path
- retention configuration documented through TOML + database policy table
- purge disabled by default in MVP pending controlled lifecycle testing

## Important boundary
This prototype is not a formal GDPR certification artifact.
It demonstrates privacy-preserving design decisions relevant to data minimization and reduced exposure.