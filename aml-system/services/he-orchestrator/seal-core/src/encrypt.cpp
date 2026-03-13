#include "seal_bridge.hpp"

#include <sstream>
#include <vector>

extern "C" const char* seal_encrypt_amount(double amount) {
    using namespace aml_he;

    auto& ctx = global_ctx();

    std::vector<double> input{amount};
    seal::Plaintext plain;
    ctx.encoder->encode(input, ctx.scale, plain);

    seal::Ciphertext cipher;
    ctx.encryptor->encrypt(plain, cipher);

    std::stringstream ss;
    cipher.save(ss);
    std::string raw = ss.str();
    std::string hex = bytes_to_hex(raw);

    return heap_copy_string(hex);
}