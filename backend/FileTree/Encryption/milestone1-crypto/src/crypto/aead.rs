use chacha20poly1305::ChaCha20Poly1305;
use chacha20poly1305::aead::{Aead, NewAead};

#[derive(Debug, Clone)]
pub struct AeadKey(pub [u8; 32]);

#[derive(Debug, Clone)]
pub struct AeadNonce(pub [u8; 12]);

#[derive(Debug)]
pub enum AeadError {
    EncryptFailed(String),
    DecryptFailed(String),
}

// for future reference: Encrypted file format: [magic][version][salt][nonce][cybertext]

pub fn encrypt_bits(
    msg: &[u8],
    key_bytes: &AeadKey,
    nonce_bytes: &AeadNonce,
) -> Result<Vec<u8>, AeadError> {
    let key = &key_bytes.0;
    let nonce = &nonce_bytes.0;

    let cipher = ChaCha20Poly1305::new(key.into());
    let ciphertext = cipher
        .encrypt(nonce.into(), msg)
        .map_err(|e| AeadError::EncryptFailed(e.to_string()))?;
    Ok(ciphertext)
}

pub fn decrypt_bits(msg: &[u8], key: &AeadKey, nonce: &AeadNonce) -> Result<Vec<u8>, AeadError> {
    let key = &key.0;
    let nonce = &nonce.0;

    let cipher = ChaCha20Poly1305::new(key.into());
    let plaintext = cipher
        .decrypt(nonce.into(), msg)
        .map_err(|e| AeadError::DecryptFailed(e.to_string()))?;
    Ok(plaintext)
}
