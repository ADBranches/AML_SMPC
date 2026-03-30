FROM rust:1.89-bookworm AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    clang \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/he-orchestrator/rust-gateway/Cargo.toml services/he-orchestrator/rust-gateway/Cargo.lock ./
COPY services/he-orchestrator/rust-gateway/build.rs ./
COPY services/he-orchestrator/rust-gateway/src ./src
COPY services/he-orchestrator/seal-core ../seal-core
COPY external/SEAL ../external/SEAL

RUN cmake -S ../seal-core -B ../seal-core/build && \
    cmake --build ../seal-core/build -j"$(nproc)"

RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/he-rust-gateway /usr/local/bin/he-gateway
COPY --from=builder /seal-core/build /opt/seal-core/build

EXPOSE 8082
CMD ["/usr/local/bin/he-gateway"]