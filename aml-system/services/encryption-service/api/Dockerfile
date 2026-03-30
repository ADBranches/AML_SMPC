FROM rust:1.89-bookworm AS builder
WORKDIR /app
COPY services/encryption-service/api/Cargo.toml services/encryption-service/api/Cargo.lock ./
COPY services/encryption-service/api/src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/encryption-service-api /usr/local/bin/encryption-service
EXPOSE 8081
CMD ["/usr/local/bin/encryption-service"]