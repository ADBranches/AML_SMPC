FROM rust:1.89-bookworm AS builder
WORKDIR /app
COPY services/bank-client/api/Cargo.toml services/bank-client/api/Cargo.lock ./
COPY services/bank-client/api/src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/api /usr/local/bin/bank-client
EXPOSE 8080
CMD ["/usr/local/bin/bank-client"]