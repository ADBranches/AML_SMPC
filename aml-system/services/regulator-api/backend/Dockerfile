FROM rust:1.89-bookworm AS builder
WORKDIR /app
COPY services/regulator-api/backend/Cargo.toml services/regulator-api/backend/Cargo.lock ./
COPY services/regulator-api/backend/src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/regulator-api-backend /usr/local/bin/regulator-api
EXPOSE 8085
CMD ["/usr/local/bin/regulator-api"]