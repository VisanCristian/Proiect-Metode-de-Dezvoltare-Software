# Milestone 1: Crypto Engine (The Secure Layer)
## Module 1: Workspace & Crypto CLI Scaffolding

### 📚 Theory & Concepts
* **Concept 1 (Cargo Workspaces):**  
  A Cargo workspace lets you manage multiple related crates (binaries/libraries) under a single `Cargo.toml`. This gives you one shared `target/` directory, a single `Cargo.lock` for consistent dependency versions, and easy builds/tests across all member crates.
* **Concept 2 (Project Layout for Security Tools):**  
  Structuring each milestone as its own binary crate (`milestone1-crypto`, `milestone2-udp`, etc.) mirrors how real-world tools evolve: you first build a standalone crypto utility, then add transport, device I/O, and finally protocol logic. Clear separation of crates makes it easier to reason about security boundaries and to test each layer independently.
* **Concept 3 (Planned Modules for Milestone 1):**  
  * **Module 1 (this one):** Workspace + CLI scaffolding (binary crate, argument parsing skeleton).  
  * **Module 2:** Password-based key derivation (Argon2/PBKDF2 wrapper, secure parameter choices).  
  * **Module 3:** Authenticated encryption engine (AEAD with AES-256-GCM or ChaCha20-Poly1305).  
  * **Module 4:** File I/O + integration (reading/writing files, streaming encryption, basic tests).
* **Resources:**  
  * https://doc.rust-lang.org/cargo/reference/workspaces.html  
  * https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html

### ⚔️ Quest: Initialize the Workspace and Milestone 1 Crypto CLI
**Objective:**  
Set up the Cargo workspace and the `milestone1-crypto` binary crate, and prepare a minimal CLI skeleton that will later become your file encryption/decryption tool.

#### Step 1: Inspect the workspace layout
* From the project root, list the files and directories to verify the structure:
  * You should see: `Cargo.toml`, `WARP.md`, and the directories `milestone1-crypto/`, `milestone2-udp/`, `milestone3-tun/`, `final-vpn/`.
  * Inside `milestone1-crypto/`, confirm there is a `Cargo.toml` and `src/main.rs`.
* *Hint:* Use `ls` in the root, and `ls milestone1-crypto/src` to confirm the presence of `main.rs`.

#### Step 2: Understand the workspace manifest
* Open the root `Cargo.toml` and identify:
  * The `[workspace]` section and its `members` array containing the four crates.
  * The `[workspace.package]` section (shared metadata like `edition`).
  * The `[workspace.dependencies]` section (currently empty, to be used later when several crates share dependencies such as `tokio` or `ring`).
* Make sure `milestone1-crypto` is listed in `members` exactly as its folder name.
* *Hint:* The Cargo Book’s *Workspaces* chapter explains how `[workspace]` and `members = [...]` interact.

#### Step 3: Ensure a workspace-level `Cargo.lock` exists
* From the workspace root, run a build once so Cargo generates `Cargo.lock`:
  * This will compile all member crates (they are trivial right now), and create a single lockfile in the root that governs all workspace members.
* Verify that `Cargo.lock` now exists alongside the root `Cargo.toml`.
* *Hint:* Running a plain `cargo build` in the root of a workspace builds all workspace members by default.

#### Step 4: Prepare `milestone1-crypto`’s `Cargo.toml` for a CLI tool
* Open `milestone1-crypto/Cargo.toml` and:
  * Confirm it defines a binary package with a `[package]` section and uses edition `2021` (or upgrade to `2021` if needed).
  * Optionally, update the `description` to something like `"Milestone 1: password-based file encryption CLI"`.
* Do **not** add crypto crates yet; those will come in later modules (key derivation and AEAD engine).
* *Hint:* Look for the `[[bin]]` section if you ever want to customize the binary name; by default, it’s the same as the package name.

#### Step 5: Replace the default `main.rs` with a CLI skeleton
* Open `milestone1-crypto/src/main.rs` and replace its content with the starter template below (or adapt it manually if you prefer typing it yourself).
* The goal is *not* to implement any encryption logic yet, but to define where:
  * Arguments (mode, input file, output file, password) will be parsed.
  * Crypto-related modules (key derivation, AEAD engine) will later be called.
* *Hint:* In later modules, you can use crates like `clap` for robust CLI parsing; for now, it’s enough to just sketch where `std::env::args()` or `clap` usage will live.

#### Step 6: Build and run the placeholder CLI
* From the workspace root, run the `milestone1-crypto` binary to ensure it compiles and runs:
  * This confirms that the workspace is correctly configured and the starter template is syntactically valid.
* You should just see a simple placeholder output (e.g., a debug print) or nothing at all yet; that’s fine.
* *Hint:* You can target a specific workspace member with `cargo run -p milestone1-crypto`.

### 🛠️ Starter Template
```rust
// file: milestone1-crypto/src/main.rs
// Milestone 1: Crypto Engine (workspace member)
// This is the CLI skeleton you will extend in later modules.

fn main() {
    // TODO: Step 1 – parse command-line arguments
    //  - You will eventually support subcommands like:
    //      encrypt <input> <output>
    //      decrypt <input> <output>
    //  - For now, you can just stub out argument handling.
    //
    // Example options you might later design:
    //  - --password (read from prompt or env)
    //  - --algorithm (aes-gcm / chacha20-poly1305)

    // TODO: Step 2 – dispatch to high-level operations
    //  - match on a future enum like CryptoCommand::Encrypt | CryptoCommand::Decrypt
    //  - Call functions you will implement in later modules, e.g.:
    //      encrypt_file(...)
    //      decrypt_file(...)

    // TODO: Step 3 – basic error handling
    //  - Decide how you want to surface errors to the user (exit codes, messages).
    //  - Later you may refactor this into a `run()` function that returns `Result<()>`.
}
```

## Module 2: Password-Based Key Derivation (KDF)

### 📚 Theory & Concepts
* **Concept 1: Why we need a KDF for passwords**  
  Raw passwords (even "strong" ones) are not suitable as encryption keys. Ciphers like AES-256 expect a uniformly random 256-bit key; human passwords are low-entropy and often guessable. A **Key Derivation Function (KDF)** takes a password + salt and stretches it into a strong key, making brute-force and rainbow-table attacks much harder.
* **Concept 2: Salt, iterations, and memory hardness**  
  A KDF normally uses:
  - A **salt**: random bytes stored alongside the ciphertext; prevents precomputed attacks and ensures the same password leads to different keys for different files.
  - **Iterations / work factor**: how many internal rounds are run; more rounds = slower for attacker and defender.
  - **Memory hardness** (for modern KDFs like Argon2): attackers must use lots of memory per guess, making GPU/ASIC attacks expensive.
* **Concept 3: Common Rust crates for KDFs**  
  We won’t implement the math ourselves. Instead, we will wrap existing, battle-tested crates, such as:
  - `argon2` (Argon2id, Argon2i etc.)
  - `pbkdf2` (via `ring` or other crates)  
  For this module, you’ll design the API and data structures; in a later step we’ll wire in a real crate.
* **Concept 4: API design for your KDF layer**  
  Rather than sprinkling KDF logic everywhere, we create a small module like `crypto::kdf` with:
  - A `KdfAlgorithm` enum (e.g., `Argon2id`, `Pbkdf2Sha256`).
  - A `KdfConfig` struct that stores parameters (iterations, memory size, parallelism, output length).
  - A function like `derive_key(password: &str, salt: &[u8], config: &KdfConfig) -> Result<[u8; 32], KdfError>`.  
  This keeps the rest of your code simple: "I have a password, give me a key".
* **Resources:**  
  * [Argon2 RFC](https://www.rfc-editor.org/rfc/rfc9106) (high level)  
  * [RustCrypto password-hash ecosystem](https://github.com/RustCrypto/password-hashes)

### ⚔️ Quest: Create a KDF Module Skeleton
**Objective:**  
Define the Rust types and function signatures for password-based key derivation, without implementing the cryptographic logic yet.

#### Step 1: Create a `crypto` module and `kdf.rs` file
* Inside `milestone1-crypto/src`, create a `crypto` folder:
  * `mkdir src/crypto`
* Inside that folder, create `kdf.rs`:
  * `touch src/crypto/kdf.rs`
* In `src/crypto/mod.rs` (new file), re-export the KDF module so you can write `use crate::crypto::kdf::derive_key;` later.
* *Hint:* Remember that `mod` declarations connect files to modules: `mod crypto;` in `main.rs` or `lib.rs`, and `pub mod kdf;` in `src/crypto/mod.rs`.

#### Step 2: Define a `KdfAlgorithm` enum
* In `src/crypto/kdf.rs`, define an enum describing which KDF you want to use:
  * Variants like `Argon2id` and `Pbkdf2Sha256` are enough for now.
* This lets your CLI later choose the algorithm via a flag, without changing encryption code everywhere.
* *Hint:* Keep it simple for now; no need for all Argon2 variants.

#### Step 3: Define a `KdfConfig` struct
* In `src/crypto/kdf.rs`, add a `KdfConfig` struct that holds:
  * `algorithm: KdfAlgorithm`
  * Parameters like `iterations`, `memory_kib`, `parallelism`, `output_len`.
* Make it `pub` so other modules (like your encryption engine) can use it.
* *Hint:* Use `u32`/`u64` for counts; we’ll choose sane defaults later.

#### Step 4: Define a `KdfError` type
* Create a simple error type for KDF failures:
  * Start with an enum `KdfError` with variants like `InvalidConfig` and `InternalError(String)`.
* This is more expressive than just using `String` everywhere and prepares you for better error handling.
* *Hint:* You don’t need to implement `Display` or `Error` yet; just define the enum.

#### Step 5: Add the `derive_key` function signature
* In `src/crypto/kdf.rs`, add a function:
  * `pub fn derive_key(password: &str, salt: &[u8], config: &KdfConfig) -> Result<[u8; 32], KdfError>`
* Inside the function body, **do not** implement the logic yet. Just put a `// TODO` and a placeholder `unimplemented!()` or `Err(KdfError::InternalError("not implemented".into()))`.
* *Hint:* `[u8; 32]` represents a fixed-size 256-bit key for AES-256 or ChaCha20-Poly1305.

#### Step 6: Wire the KDF module into your crate
* In `src/main.rs` or a new `src/lib.rs`, add:
  * `mod crypto;`
* In `src/crypto/mod.rs`, add:
  * `pub mod kdf;`
* Try compiling with `cargo build` to ensure the module structure is correct (it should fail only because `unimplemented!()` panics at runtime, which is fine for now).

### 🛠️ Starter Template
```rust
// file: milestone1-crypto/src/crypto/kdf.rs
// Password-Based Key Derivation (KDF) skeleton for Milestone 1

/// Which KDF algorithm to use when deriving keys from passwords.
#[derive(Debug, Clone, Copy)]
pub enum KdfAlgorithm {
    /// Argon2id – memory-hard, modern choice for new systems.
    Argon2id,
    /// PBKDF2-HMAC-SHA256 – widely supported, but less memory-hard.
    Pbkdf2Sha256,
}

/// Configuration parameters for the KDF.
#[derive(Debug, Clone)]
pub struct KdfConfig {
    pub algorithm: KdfAlgorithm,
    pub iterations: u32,
    pub memory_kib: u32,
    pub parallelism: u32,
    pub output_len: usize, // desired key length in bytes, e.g. 32 for 256-bit keys
}

/// Errors that can occur during key derivation.
#[derive(Debug)]
pub enum KdfError {
    InvalidConfig(String),
    InternalError(String),
}

/// Derive a symmetric encryption key from a password and salt.
///
/// * `password` – user-supplied password.
/// * `salt` – random bytes stored alongside the ciphertext.
/// * `config` – algorithm and parameters controlling the work factor.
pub fn derive_key(
    password: &str,
    salt: &[u8],
    config: &KdfConfig,
) -> Result<[u8; 32], KdfError> {
    // TODO: Implement key derivation using a real KDF crate (Argon2 or PBKDF2).
    // For now, return a placeholder error so you remember to fill this in later.
    Err(KdfError::InternalError("derive_key is not implemented yet".to_string()))
}
```

## Module 3: Authenticated Encryption Engine (AEAD)

### 📚 Theory & Concepts
* **Concept 1: Why we need AEAD (not just encryption)**  
  A modern VPN must provide both **confidentiality** (hiding the payload) and **integrity/authentication** (detecting tampering). AEAD modes (Authenticated Encryption with Associated Data), like **AES-256-GCM** and **ChaCha20-Poly1305**, encrypt data and produce an authentication tag. When decrypting, the AEAD checks the tag and **rejects** modified ciphertext.
* **Concept 2: Nonces and key reuse**  
  AEAD algorithms require a **nonce** (sometimes called IV). Security depends critically on never reusing the same (key, nonce) pair:
  * Nonces are usually 96 bits (12 bytes) for GCM and ChaCha20-Poly1305.
  * They are often constructed as a combination of a random prefix and a counter, or just a counter in a secure protocol.
  * Reusing nonces with the same key can completely break confidentiality.
* **Concept 3: Separating key derivation from encryption**  
  In Milestone 1, Module 2, we derived a symmetric key from a password using a KDF. In this module, that key becomes the input to an AEAD cipher. The KDF does **not** encrypt data; it just produces a strong key for the AEAD engine to use.
* **Concept 4: API design for your AEAD engine**  
  Instead of sprinkling cipher calls all over the CLI, you’ll design a small `crypto::aead` module with:
  * An `AeadAlgorithm` enum (e.g., `Aes256Gcm`, `ChaCha20Poly1305`).
  * An `AeadKey` newtype that wraps the raw `[u8; 32]` key.
  * Functions like `encrypt_in_place` / `decrypt_in_place` or higher-level `encrypt_bytes` / `decrypt_bytes` that take a key, nonce, and plaintext/ciphertext buffers.
* **Resources:**  
  * AEAD overview: <https://datatracker.ietf.org/doc/html/rfc5116>  
  * RustCrypto AEAD collection: <https://github.com/RustCrypto/AEADs>

### ⚔️ Quest: Design the AEAD Encryption Engine Skeleton
**Objective:**  
Define the structures and function signatures for your authenticated encryption engine, without implementing the cryptographic logic yet.

#### Step 1: Create an `aead` module
* Inside `milestone1-crypto/src/crypto`, create a new file:
  * `touch src/crypto/aead.rs`
* In `src/crypto/mod.rs`, expose it:
  * Add `pub mod aead;` alongside `pub mod kdf;`.
* *Hint:* This mirrors the pattern you used for `crypto::kdf`.

#### Step 2: Define `AeadAlgorithm` and `AeadKey`
* In `src/crypto/aead.rs`, define:
  * An `AeadAlgorithm` enum with variants like `Aes256Gcm` and `ChaCha20Poly1305`.
  * An `AeadKey` newtype around `[u8; 32]`:
    * `pub struct AeadKey(pub [u8; 32]);`
* This keeps the raw key bytes from being confused with arbitrary byte arrays elsewhere.
* *Hint:* Derive `Debug` for development, but be careful **not** to log keys in real code.

#### Step 3: Define an `AeadNonce` type
* Add a small type to represent nonces:
  * For example, `pub struct AeadNonce(pub [u8; 12]);` for a 96-bit nonce.
* You can later add helper constructors (e.g., from a counter or random bytes).
* *Hint:* Using a fixed-size array type makes it harder to accidentally pass the wrong length.

#### Step 4: Define an `AeadError` enum
* Create an error type for AEAD operations:
  * `AeadError::EncryptFailed(String)`
  * `AeadError::DecryptFailed(String)`
* This will allow you to distinguish AEAD failures from KDF failures in your CLI.
* *Hint:* You can mirror the style of your `KdfError` type.

#### Step 5: Add `encrypt_bytes` and `decrypt_bytes` signatures
* In `aead.rs`, add two core functions:
  * `pub fn encrypt_bytes(key: &AeadKey, nonce: &AeadNonce, plaintext: &[u8], aad: &[u8]) -> Result<Vec<u8>, AeadError>`
  * `pub fn decrypt_bytes(key: &AeadKey, nonce: &AeadNonce, ciphertext: &[u8], aad: &[u8]) -> Result<Vec<u8>, AeadError>`
* Inside each function body, **do not** implement the cipher yet. Use `// TODO` and return a placeholder error.
* *Hint:* `aad` stands for Associated Authenticated Data (like headers) that are not encrypted but must be authenticated.

#### Step 6: Plan how the CLI will call the AEAD engine
* Think about how `commands.rs` will eventually use the AEAD functions:
  * For encryption:
    1. Use `crypto::kdf::derive_key` to obtain `[u8; 32]`.
    2. Wrap it in `AeadKey`.
    3. Construct a nonce (later module will handle this more carefully).
    4. Call `encrypt_bytes(...)` on the file contents.
  * For decryption, do the reverse.
* You don’t need to change your CLI code yet; just ensure the AEAD API you define will fit naturally into that flow.

### 🛠️ Starter Template
```rust
// file: milestone1-crypto/src/crypto/aead.rs
// Authenticated Encryption (AEAD) skeleton for Milestone 1

/// Supported AEAD algorithms for file encryption.
#[derive(Debug, Clone, Copy)]
pub enum AeadAlgorithm {
    /// AES-256 in Galois/Counter Mode.
    Aes256Gcm,
    /// ChaCha20-Poly1305 stream cipher with MAC.
    ChaCha20Poly1305,
}

/// Wrapper around a 256-bit symmetric key for AEAD.
#[derive(Debug, Clone)]
pub struct AeadKey(pub [u8; 32]);

/// Wrapper around a 96-bit AEAD nonce (IV).
#[derive(Debug, Clone, Copy)]
pub struct AeadNonce(pub [u8; 12]);

/// Errors that can occur during AEAD operations.
#[derive(Debug)]
pub enum AeadError {
    EncryptFailed(String),
    DecryptFailed(String),
}

/// Encrypt a plaintext buffer using the given key, nonce, and associated data.
///
/// * `key`  – symmetric key derived from the user password.
/// * `nonce` – unique nonce for this encryption under the given key.
/// * `plaintext` – bytes to encrypt.
/// * `aad` – associated data to authenticate but not encrypt.
pub fn encrypt_bytes(
    key: &AeadKey,
    nonce: &AeadNonce,
    plaintext: &[u8],
    aad: &[u8],
) -> Result<Vec<u8>, AeadError> {
    // TODO: Implement AEAD encryption using a crate like `aes-gcm` or `chacha20poly1305`.
    // For now, return a placeholder error so you remember to fill this in later.
    Err(AeadError::EncryptFailed(
        "encrypt_bytes is not implemented yet".to_string(),
    ))
}

/// Decrypt a ciphertext buffer using the given key, nonce, and associated data.
///
/// On authentication failure, this must return an error and NEVER return corrupted plaintext.
pub fn decrypt_bytes(
    key: &AeadKey,
    nonce: &AeadNonce,
    ciphertext: &[u8],
    aad: &[u8],
) -> Result<Vec<u8>, AeadError> {
    // TODO: Implement AEAD decryption using the same crate and parameters as `encrypt_bytes`.
    Err(AeadError::DecryptFailed(
        "decrypt_bytes is not implemented yet".to_string(),
    ))
}
``` 

## Module 4: File I/O and Encryption/Decryption Integration

### 📚 Theory & Concepts
* **Concept 1: Files as byte streams**  
  In Rust, files are typically read and written as raw bytes (`Vec<u8>` or slices like `&[u8]`). Your crypto engine operates on bytes, so your CLI’s job is to bridge between **files on disk** and **in-memory byte buffers**.
* **Concept 2: Simple file formats for encrypted data**  
  When you encrypt a file, you need to store not just the ciphertext, but also metadata the decryptor needs: at least the **salt** (for the KDF) and the **nonce** (for the AEAD). A simple custom format might be: `[magic bytes][version][salt][nonce][ciphertext]`.
* **Concept 3: Separation of concerns**  
  It’s useful to keep responsibilities clear:
  - `commands.rs` (or similar): parse CLI arguments, handle files, orchestrate KDF + AEAD.
  - `crypto::kdf`: derive a key from a password and salt.
  - `crypto::aead`: encrypt/decrypt in-memory byte buffers using a key and nonce.
* **Resources:**  
  * Rust book I/O chapter ("Using the File System").  
  * `std::fs` and `std::io` docs for file handling.

### ⚔️ Quest: Wire Crypto into File I/O (Encrypt/Decrypt CLI)
**Objective:**  
Connect your KDF and AEAD modules to real file I/O so that `encrypt` reads a file, (eventually) encrypts it, and writes an output file, and `decrypt` does the reverse. In this module you’ll focus on **structure and data flow**, not on finishing the AEAD logic.

#### Step 1: Decide on an encrypted file format
* Sketch a minimal format that contains everything decryption will need. For example:
  * 4 bytes: magic constant (e.g. `b"VRPT"` for your project).
  * 1 byte: version (e.g. `1`).
  * 16 bytes: salt for the KDF.
  * 12 bytes: nonce for the AEAD.
  * Remaining bytes: ciphertext (including authentication tag, once AEAD is real).
* Write this down in comments in your code so future you (and later milestones) know how to parse it.
* *Hint:* Use fixed sizes for salt and nonce so offsets are easy to compute.

#### Step 2: Add basic file reading for `encrypt`
* In `src/commands.rs`, update the `encrypt` function to:
  * Take an `input_file: &str` and a `password: &str` (as it already does).
  * Read the entire file into memory using `std::fs::read(input_file)`.
  * Propagate errors upward by mapping them into `String` (e.g. `map_err(|e| e.to_string())`).
* For now, just return a message that includes the input size, to verify the plumbing works.
* *Hint:* `std::fs::read` returns a `Vec<u8>` with the file contents.

#### Step 3: Generate or accept a salt and derive a key
* Inside `encrypt`, after reading the file:
  * Generate a random salt using a simple placeholder for now (you can improve randomness in a later milestone).
  * Call `crypto::kdf::derive_key` with the password, salt, and `KDFConfig::default()`.
* Decide how you will store the salt:
  * For now, you can just include it in the formatted output string, or better, plan to prefix it to the output bytes per your file format.
* *Hint:* Even if randomness is not perfect yet, structuring the code now makes it easier to plug in a proper RNG later.

#### Step 4: Prepare to call AEAD encryption
* Convert the derived key (`[u8; 32]`) into an `AeadKey` and create an `AeadNonce` placeholder.
* Call your (still TODO) `crypto::aead::encrypt_bytes` function with:
  * `&AeadKey`, `&AeadNonce`, the plaintext bytes, and an empty AAD (`&[]`).
* For now, you can:
  * Either keep this call commented out with a clear `// TODO` explaining what will happen here.
  * Or call it and propagate the `AeadError` as a `String` using `map_err`.
* *Hint:* This step is mainly about wiring the data flow; the actual encryption logic will be implemented once your AEAD module is complete.

#### Step 5: Add a simple output path and write the encrypted file
* Extend your `Encrypt` CLI command to also accept an `--output` path, or derive one from the input (e.g. append `.enc`).
* In `encrypt`, construct the final byte buffer following your format from Step 1:
  * Push magic + version.
  * Append salt.
  * Append nonce.
  * Append ciphertext (or placeholder bytes for now).
* Write this buffer to disk using `std::fs::write(output_path, buffer)`.
* *Hint:* Use a `Vec<u8>` and `extend_from_slice` to build the output in order.

#### Step 6: Implement the `decrypt` data flow (symmetric to encrypt)
* Update `decrypt` in `src/commands.rs` to:
  * Read the encrypted file into memory.
  * Verify and strip the magic + version.
  * Parse out the salt and nonce slices.
  * Derive the key from the password and salt using the same KDF settings.
  * Call `decrypt_bytes` on the remaining ciphertext bytes.
  * Write the recovered plaintext to the output file (again using either a new `--output` CLI argument or a derived name).
* For now, if `decrypt_bytes` is still unimplemented, you can:
  * Return a placeholder error like "decrypt not implemented yet".
  * Or structure the code so that everything up to the `decrypt_bytes` call is complete, then `todo!()` at the call site.
* *Hint:* Be careful with indices when slicing the byte buffer – off-by-one bugs are very common here.

#### Step 7: Add minimal error reporting and tests
* Make sure `encrypt` and `decrypt` propagate I/O and crypto errors nicely as `Result<_, String>` so `main` can print them.
* Write one or two very small tests (or manual test commands) that:
  * Create a tiny input file.
  * Run `encrypt` and then `decrypt`.
  * Verify that the decrypted content matches the original (once AEAD is implemented).
* *Hint:* Even before real AEAD, you can test the file format parsing and I/O by stubbing AEAD to just copy the data through.

### 🛠️ Starter Template
```rust
// file: milestone1-crypto/src/commands.rs
// File I/O + Crypto integration skeleton for Milestone 1, Module 4

use crate::crypto;

pub fn encrypt(input_file: &str, password: &str) -> Result<String, String> {
    // Step 2: Read input file into memory
    let plaintext = std::fs::read(input_file).map_err(|e| format!("failed to read file: {e}"))?;

    // Step 3: Generate salt and derive key (placeholder salt for now)
    let salt = b"fixed-salt-16b"; // TODO: replace with real random salt (16 bytes)
    let key_bytes = crypto::kdf::derive_key(password, salt, &crypto::kdf::KDFConfig::default())
        .map_err(|e| format!("KDF error: {:?}", e))?;

    // Step 4: Wrap key and prepare nonce (placeholder nonce for now)
    let aead_key = crypto::aead::AeadKey(key_bytes);
    let nonce_bytes = [0u8; 12]; // TODO: replace with real random/unique nonce
    let aead_nonce = crypto::aead::AeadNonce(nonce_bytes);

    // Step 4 (continued): Call AEAD encryption (still TODO in crypto::aead)
    // let ciphertext = crypto::aead::encrypt_bytes(&aead_key, &aead_nonce, &plaintext, &[])
    //     .map_err(|e| format!("AEAD encrypt error: {:?}", e))?;

    // Step 5: Build output buffer following your file format
    let mut output = Vec::new();
    output.extend_from_slice(b"VRPT"); // magic
    output.push(1); // version
    output.extend_from_slice(salt);
    output.extend_from_slice(&nonce_bytes);
    // TODO: append ciphertext once AEAD is implemented

    // TODO: write `output` to an output file (derived or CLI-provided)

    Ok(format!(
        "Encrypt placeholder: {input_file} with password of length {} ({} bytes read)",
        password.len(),
        plaintext.len()
    ))
}

pub fn decrypt(input_file: &str, password: &str) -> Result<String, String> {
    // Step 6: Read encrypted file and parse header + metadata
    let data = std::fs::read(input_file).map_err(|e| format!("failed to read file: {e}"))?;

    // TODO: verify magic + version, extract salt and nonce, derive key,
    // and call crypto::aead::decrypt_bytes(...) once implemented.

    Ok(format!("Decrypt placeholder: {input_file} with password of length {}", password.len()))
}
```
