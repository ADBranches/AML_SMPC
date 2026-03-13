
#!/usr/bin/env bash
set -euo pipefail

NAME="${1:?usage: issue-cert.sh <service-name>}"

mkdir -p libs/security/mtls/certs/"$NAME"

openssl genrsa -out libs/security/mtls/certs/"$NAME"/"$NAME".key 2048

openssl req -new \
  -key libs/security/mtls/certs/"$NAME"/"$NAME".key \
  -out libs/security/mtls/certs/"$NAME"/"$NAME".csr \
  -subj "/C=UG/O=AML System/OU=Services/CN=$NAME"

openssl x509 -req \
  -in libs/security/mtls/certs/"$NAME"/"$NAME".csr \
  -CA libs/security/mtls/ca/rootCA.crt \
  -CAkey libs/security/mtls/ca/rootCA.key \
  -CAcreateserial \
  -out libs/security/mtls/certs/"$NAME"/"$NAME".crt \
  -days 825 -sha256

echo "issued cert for $NAME"