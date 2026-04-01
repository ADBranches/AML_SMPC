#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <vector>

#include "seal/seal.h"

namespace aml_he {

struct GlobalSealContext {
    std::shared_ptr<seal::SEALContext> context;
    seal::PublicKey public_key;
    seal::SecretKey secret_key;
    seal::RelinKeys relin_keys;
    seal::GaloisKeys galois_keys;
    std::unique_ptr<seal::Encryptor> encryptor;
    std::unique_ptr<seal::Decryptor> decryptor;
    std::unique_ptr<seal::Evaluator> evaluator;
    std::unique_ptr<seal::CKKSEncoder> encoder;
    double scale;
};

GlobalSealContext& global_ctx();

std::string bytes_to_hex(const std::string& input);
std::string hex_to_bytes(const std::string& input);
char* heap_copy_string(const std::string& s);

void set_last_error(const std::string& msg);
const std::string& last_error();

} // namespace aml_he

extern "C" {
    const char* seal_encrypt_amount(double amount);
    const char* seal_sum_ciphertexts(const char* lhs_hex, const char* rhs_hex);
    double seal_decrypt_amount(const char* cipher_hex);
    const char* seal_last_error_message();
    void seal_free_string(const char* ptr);
}