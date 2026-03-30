FROM rust:1.89-bookworm AS builder
WORKDIR /app
COPY services/smpc-orchestrator/runtime/Cargo.toml services/smpc-orchestrator/runtime/Cargo.lock ./
COPY services/smpc-orchestrator/runtime/src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/runtime /usr/local/bin/smpc-runtime
COPY services/smpc-orchestrator/programs /opt/aml-system/services/smpc-orchestrator/programs
ENV AML_ROOT_DIR=/opt/aml-system
EXPOSE 8083
CMD ["/usr/local/bin/smpc-runtime"]