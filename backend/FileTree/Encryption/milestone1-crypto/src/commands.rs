use crate::crypto::aead::{AeadKey, AeadNonce, decrypt_bits, encrypt_bits};
use crate::crypto::kdf::{KDFConfig, derive_key};

use rand::{TryRngCore, rngs::OsRng};

use clap::Subcommand;
use std::fs;
#[derive(Subcommand, Debug)]
pub enum Command {
    Encrypt {
        #[arg(short, long)]
        input: String,

        #[arg(short, long)]
        password: String,
    },

    Decrypt {
        #[arg(short, long)]
        input: String,

        #[arg(short, long)]
        password: String,
    },
}

pub fn encrypt(input_file: &str, password: &str) -> Result<String, String> {
    let plaintext = fs::read(&input_file).map_err(|e| e.to_string())?;

    let mut salt = [0u8; 32];
    let mut nonce_bytes = [0u8; 12];

    OsRng.try_fill_bytes(&mut salt).map_err(|e| e.to_string())?;
    OsRng
        .try_fill_bytes(&mut nonce_bytes)
        .map_err(|e| e.to_string())?;

    let derived_key = derive_key(password, &salt, &KDFConfig::default())
        .map_err(|e| format!("Failed to derive key: {:?}", e))?;

    // Wrap raw bytes into AEAD types
    let aead_key = AeadKey(derived_key);
    let aead_nonce = AeadNonce(nonce_bytes);

    let _ciphertext = encrypt_bits(&plaintext, &aead_key, &aead_nonce)
        .map_err(|e| format!("Failed to encrypt: {:?}", e))?;

    let mut output = Vec::new();
    output.extend_from_slice(b"VPN");
    output.push(1u8);
    output.extend_from_slice(&salt);
    output.extend_from_slice(&nonce_bytes);
    output.extend_from_slice(&_ciphertext);

    let output_path = format!("{input_file}.enc");
    fs::write(&output_path, output).map_err(|e| e.to_string())?;
    Ok("Encrypted successfully".to_string())
}

pub fn decrypt(input_file: &str, password: &str) -> Result<String, String> {
    let gibberish = fs::read(&input_file).map_err(|e| e.to_string())?;

    let (magic, rest) = gibberish.split_at(3);
    if magic != b"VPN" {
        return Err("Invalid magic".to_string());
    }

    let (version, rest) = rest.split_at(1);
    if version[0] != 1u8 {
        return Err("Unsupported version".to_string());
    }

    let (salt, rest) = rest.split_at(32);
    let (nonce_bytes, rest) = rest.split_at(12);
    let ciphertext = rest;
    let derived_key = derive_key(password, &salt, &KDFConfig::default())
        .map_err(|e| format!("Failed to derive key: {:?}", e))?;
    let aead_key = AeadKey(derived_key);

    let mut nonce = [0u8; 12];
    nonce.copy_from_slice(nonce_bytes);

    let aead_nonce = AeadNonce(nonce);

    let plaintext = decrypt_bits(&ciphertext, &aead_key, &aead_nonce)
        .map_err(|e| format!("Failed to decrypt: {:?}", e))?;

    let output_path = format!("{input_file}").replace(".enc", ".dec");

    fs::write(&output_path, plaintext).map_err(|e| e.to_string())?;
    Ok("Decrypted successfully".to_string())
}
