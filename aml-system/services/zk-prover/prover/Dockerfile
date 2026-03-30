FROM rust:1.89-bookworm AS builder
WORKDIR /app

COPY services/zk-prover/prover/Cargo.toml services/zk-prover/prover/Cargo.lock ./
COPY services/zk-prover/prover/src ./src
COPY services/zk-prover/verifier ../verifier
COPY services/zk-prover/circuits ../circuits

RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/zk-prover-service /usr/local/bin/zk-prover
EXPOSE 8084
CMD ["/usr/local/bin/zk-prover"]