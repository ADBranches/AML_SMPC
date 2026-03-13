# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION ${CMAKE_VERSION}) # this file comes with cmake

# If CMAKE_DISABLE_SOURCE_CHANGES is set to true and the source directory is an
# existing directory in our source tree, calling file(MAKE_DIRECTORY) on it
# would cause a fatal error, even though it would be a no-op.
if(NOT EXISTS "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-src")
  file(MAKE_DIRECTORY "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-src")
endif()
file(MAKE_DIRECTORY
  "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-build"
  "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix"
  "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix/tmp"
  "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix/src/msgsl-populate-stamp"
  "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix/src"
  "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix/src/msgsl-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix/src/msgsl-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/seal/thirdparty/msgsl-subbuild/msgsl-populate-prefix/src/msgsl-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
