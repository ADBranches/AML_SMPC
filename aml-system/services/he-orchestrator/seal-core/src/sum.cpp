#include "seal_bridge.hpp"

#include <sstream>
#include <stdexcept>

extern "C" const char* seal_sum_ciphertexts(const char* lhs_hex, const char* rhs_hex) {
    using namespace aml_he;

    if (!lhs_hex || !rhs_hex) {
        return nullptr;
    }

    auto& ctx = global_ctx();

    seal::Ciphertext lhs;
    seal::Ciphertext rhs;

    {
        std::string lhs_raw = hex_to_bytes(lhs_hex);
        std::stringstream lss(lhs_raw);
        lhs.load(*ctx.context, lss);
    }

    {
        std::string rhs_raw = hex_to_bytes(rhs_hex);
        std::stringstream rss(rhs_raw);
        rhs.load(*ctx.context, rss);
    }

    seal::Ciphertext result;
    ctx.evaluator->add(lhs, rhs, result);

    std::stringstream out;
    result.save(out);
    std::string raw = out.str();
    std::string hex = bytes_to_hex(raw);

    return heap_copy_string(hex);
}