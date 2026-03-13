#include "seal_bridge.hpp"

#include <sstream>
#include <vector>

extern "C" double seal_decrypt_amount(const char* cipher_hex) {
    using namespace aml_he;

    if (!cipher_hex) {
        return 0.0;
    }

    auto& ctx = global_ctx();

    seal::Ciphertext cipher;
    {
        std::string raw = hex_to_bytes(cipher_hex);
        std::stringstream ss(raw);
        cipher.load(*ctx.context, ss);
    }

    seal::Plaintext plain;
    ctx.decryptor->decrypt(cipher, plain);

    std::vector<double> decoded;
    ctx.encoder->decode(plain, decoded);

    if (decoded.empty()) {
        return 0.0;
    }

    return decoded[0];
}