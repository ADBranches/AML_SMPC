cmake_minimum_required(VERSION 3.16)
project(aml_seal_bridge LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Adjust this path if your SEAL checkout lives elsewhere.
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../../external/SEAL
                 ${CMAKE_CURRENT_BINARY_DIR}/seal
                 EXCLUDE_FROM_ALL)

add_library(seal_bridge SHARED
    src/context.cpp
    src/encrypt.cpp
    src/sum.cpp
    src/decrypt.cpp
)

target_include_directories(seal_bridge PUBLIC include)
target_link_libraries(seal_bridge PUBLIC SEAL::seal)