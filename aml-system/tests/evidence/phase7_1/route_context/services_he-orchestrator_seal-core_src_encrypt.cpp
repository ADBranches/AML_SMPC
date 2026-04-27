#include "seal_bridge.hpp"

#include <sstream>
#include <vector>
#include <exception>

extern "C" const char* seal_encrypt_amount(double amount) {
    using namespace aml_he;

    try {
        set_last_error("");

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
    } catch (const std::exception& ex) {
        set_last_error(ex.what());
        return nullptr;
    } catch (...) {
        set_last_error("Unknown C++ exception in seal_encrypt_amount");
        return nullptr;
    }
}