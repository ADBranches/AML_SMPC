#include "seal_bridge.hpp"

#include <cmath>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <vector>
#include <cstring>
#include <cstdlib>

namespace aml_he {

GlobalSealContext& global_ctx() {
    static GlobalSealContext instance = []() {
        GlobalSealContext ctx;

        seal::EncryptionParameters parms(seal::scheme_type::ckks);
        std::size_t poly_modulus_degree = 8192;
        parms.set_poly_modulus_degree(poly_modulus_degree);
        parms.set_coeff_modulus(
            seal::CoeffModulus::Create(poly_modulus_degree, {60, 40, 40, 60}));

        ctx.context = std::make_shared<seal::SEALContext>(parms);

        seal::KeyGenerator keygen(*ctx.context);

        ctx.secret_key = keygen.secret_key();
        keygen.create_public_key(ctx.public_key);
        keygen.create_relin_keys(ctx.relin_keys);
        keygen.create_galois_keys(ctx.galois_keys);

        ctx.encryptor = std::make_unique<seal::Encryptor>(*ctx.context, ctx.public_key);
        ctx.decryptor = std::make_unique<seal::Decryptor>(*ctx.context, ctx.secret_key);
        ctx.evaluator = std::make_unique<seal::Evaluator>(*ctx.context);
        ctx.encoder = std::make_unique<seal::CKKSEncoder>(*ctx.context);
        ctx.scale = std::pow(2.0, 40);

        return ctx;
    }();

    return instance;
}

std::string bytes_to_hex(const std::string& input) {
    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    for (unsigned char c : input) {
        oss << std::setw(2) << static_cast<int>(c);
    }
    return oss.str();
}

std::string hex_to_bytes(const std::string& input) {
    if (input.size() % 2 != 0) {
        throw std::runtime_error("Invalid hex length");
    }

    std::string out;
    out.reserve(input.size() / 2);

    for (std::size_t i = 0; i < input.size(); i += 2) {
        auto byte = input.substr(i, 2);
        char chr = static_cast<char>(std::stoi(byte, nullptr, 16));
        out.push_back(chr);
    }

    return out;
}

char* heap_copy_string(const std::string& s) {
    char* out = static_cast<char*>(std::malloc(s.size() + 1));
    if (!out) {
        return nullptr;
    }
    std::memcpy(out, s.c_str(), s.size() + 1);
    return out;
}

} // namespace aml_he

extern "C" void seal_free_string(const char* ptr) {
    if (ptr) {
        std::free((void*)ptr);
    }
}
