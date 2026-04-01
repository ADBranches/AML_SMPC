#include "seal_bridge.hpp"

#include <sstream>
#include <vector>
#include <limits>
#include <exception>

extern "C" double seal_decrypt_amount(const char* cipher_hex) {
    using namespace aml_he;

    try {
        set_last_error("");

        if (!cipher_hex) {
            set_last_error("cipher_hex must not be null");
            return std::numeric_limits<double>::quiet_NaN();
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
            set_last_error("Decoded plaintext was empty");
            return std::numeric_limits<double>::quiet_NaN();
        }

        return decoded[0];
    } catch (const std::exception& ex) {
        set_last_error(ex.what());
        return std::numeric_limits<double>::quiet_NaN();
    } catch (...) {
        set_last_error("Unknown C++ exception in seal_decrypt_amount");
        return std::numeric_limits<double>::quiet_NaN();
    }
}