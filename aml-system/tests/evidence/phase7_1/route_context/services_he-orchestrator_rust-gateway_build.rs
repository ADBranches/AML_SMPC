fn main() {
    println!("cargo:rustc-link-search=native=../seal-core/build");
    println!("cargo:rustc-link-lib=dylib=seal_bridge");
    println!("cargo:rerun-if-changed=src/ffi.rs");
}