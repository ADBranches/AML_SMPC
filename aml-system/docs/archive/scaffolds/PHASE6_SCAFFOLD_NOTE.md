# Phase 6 scaffold note

The original `phase6_scaffold.zip` was an overlay-style scaffold, not a full project package.

Observed characteristics:
- no parent wrapper folder inside the zip
- includes only k3s manifests, monitoring files, and CI/demo scripts
- does not include Dockerfiles/Containerfiles for service images
- therefore custom Kubernetes workloads cannot start until image build definitions are authored manually

The zip was moved here for record-keeping and should not be treated as a complete deployment artifact.
