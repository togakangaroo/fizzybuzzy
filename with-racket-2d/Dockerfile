FROM alpine:3.22

# Racket ships glibc Linux builds; gcompat lets them run on musl.
RUN apk add --no-cache gcompat libstdc++ ca-certificates

ARG RACKET_VERSION=9.2
ARG TARGETARCH
RUN case "$TARGETARCH" in \
      arm64) RKT_ARCH=aarch64 ;; \
      amd64) RKT_ARCH=x86_64 ;; \
      *) echo "unsupported arch: $TARGETARCH" && exit 1 ;; \
    esac && \
    wget -q -O /tmp/racket.tgz \
      "https://mirror.racket-lang.org/installers/${RACKET_VERSION}/racket-minimal-${RACKET_VERSION}-${RKT_ARCH}-linux-buster-cs.tgz" && \
    tar -xzf /tmp/racket.tgz -C /opt && \
    rm /tmp/racket.tgz
ENV PATH="/opt/racket/bin:${PATH}"

RUN raco pkg install --auto --batch 2d-lib

WORKDIR /app
COPY fizzbuzz.rkt .
CMD ["racket", "fizzbuzz.rkt"]
