from . import models
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
import base64
from io import BytesIO
from reportlab.pdfgen import canvas
import subprocess
import os
from django.conf import settings


CRYPTO_BINARY = os.path.join(
    settings.BASE_DIR, 'FileTree', 'Encryption', 'milestone1-crypto', 'target', 'release', 'milestone1-crypto'
)


def get_file_extension(file_name: str) -> str:
    if '.' not in file_name:
        return ''

    return file_name.rsplit('.', 1)[-1].lower()


def get_file_type(file_name: str) -> str:
    extension = get_file_extension(file_name)

    if extension == 'pdf':
        return 'pdf'

    return 'text'


def get_or_create_encryption_key(user):
    """Get or create a stable encryption key for the user."""
    key, _ = models.EncryptionKey.objects.get_or_create(user=user)
    return key.token


def folder_create(*, folder_name: str, user_id: int) -> models.Folder:
    folder = models.Folder(user=user_id, name=folder_name)
    folder.save()
    return folder

def folder_remove(*, folder_id:int) -> None:
    folder = models.Folder.objects.get(pk=folder_id)
    files = models.File.objects.filter(folder=folder_id)
    for file in files:
        default_storage.delete(file.location)
        file.delete()
    folder.delete()

def file_add(*, file, folder_id, user_id, encrypt=False, user=None):
    user_folder = "id_" + str(user_id)
    file_location = default_storage.save(f"{user_folder}/{file.name}", file)
    new_file = models.File(name=file.name, location=file_location, added_at=timezone.now(), updated_at=timezone.now(), folder_id=folder_id)
    new_file.save()

    if encrypt and user:
        new_file = encrypt_file(new_file, user)

    return new_file


def file_create(*, name, content, folder_id, user_id, encrypt=False, user=None):
    """Create a new .md file from text content."""
    if not name.endswith('.md'):
        name = name + '.md'

    user_folder = "id_" + str(user_id)
    file_content = ContentFile(content.encode('utf-8'))
    file_location = default_storage.save(f"{user_folder}/{name}", file_content)

    new_file = models.File(
        name=name,
        location=file_location,
        added_at=timezone.now(),
        updated_at=timezone.now(),
        folder_id=folder_id,
    )
    new_file.save()

    if encrypt and user:
        new_file = encrypt_file(new_file, user)

    return new_file


def encrypt_file(file_obj, user):
    """Encrypt a file using the Rust binary and the user's encryption token."""
    encryption_password = get_or_create_encryption_key(user)

    # Get the absolute path to the plaintext file
    plaintext_path = os.path.join(settings.MEDIA_ROOT, file_obj.location)

    # Run the Rust binary to encrypt
    result = subprocess.run(
        [CRYPTO_BINARY, 'encrypt', '-i', plaintext_path, '-p', encryption_password],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        raise Exception(f"Encryption failed: {result.stderr}")

    encrypted_path = plaintext_path + '.enc'

    # Move encrypted file to the _enc folder
    user_id = user.id
    enc_folder = os.path.join(settings.MEDIA_ROOT, f"id_{user_id}_enc")
    os.makedirs(enc_folder, exist_ok=True)

    final_enc_name = file_obj.name + '.enc'
    final_enc_path = os.path.join(enc_folder, final_enc_name)

    os.rename(encrypted_path, final_enc_path)

    # Delete the plaintext file
    if os.path.exists(plaintext_path):
        os.remove(plaintext_path)

    # Update the DB record
    new_location = f"id_{user_id}_enc/{final_enc_name}"
    file_obj.location = new_location
    file_obj.is_encrypted = True
    file_obj.save(update_fields=['location', 'is_encrypted'])

    return file_obj


def decrypt_file_content(file_obj, user):
    """Decrypt a file on-the-fly and return its text content."""
    encryption_password = get_or_create_encryption_key(user)

    encrypted_path = os.path.join(settings.MEDIA_ROOT, file_obj.location)

    # Run the Rust binary to decrypt
    result = subprocess.run(
        [CRYPTO_BINARY, 'decrypt', '-i', encrypted_path, '-p', encryption_password],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        raise Exception(f"Decryption failed: {result.stderr}")

    # Read the decrypted file
    dec_path = encrypted_path.replace('.enc', '.dec')
    with open(dec_path, 'rb') as f:
        content = f.read()

    # Clean up the temp decrypted file
    if os.path.exists(dec_path):
        os.remove(dec_path)

    return content


def file_remove(*, file_id: int) -> None:
    file = models.File.objects.get(pk=file_id)
    default_storage.delete(file.location)
    file.delete()


def file_get_content(*, file_id: int, user=None) -> dict:
    file = models.File.objects.get(pk=file_id)
    file_type = get_file_type(file.name)

    if file.is_encrypted and user:
        raw_content = decrypt_file_content(file, user)
        if file_type == 'pdf':
            content = base64.b64encode(raw_content).decode('utf-8')
        else:
            content = raw_content.decode('utf-8')

        return {
            'id': file.id,
            'name': file.name.replace('.enc', '') if file.name.endswith('.enc') else file.name,
            'type': file_type,
            'content': content,
            'is_encrypted': True,
        }

    if file_type == 'pdf':
        with default_storage.open(file.location, 'rb') as stored_file:
            content = base64.b64encode(stored_file.read()).decode('utf-8')
    else:
        with default_storage.open(file.location, 'r') as stored_file:
            content = stored_file.read()

    return {
        'id': file.id,
        'name': file.name,
        'type': file_type,
        'content': content,
    }


def file_update(*, file_id: int, content: str) -> models.File:
    file = models.File.objects.get(pk=file_id)

    with default_storage.open(file.location, 'w') as stored_file:
        stored_file.write(content)

    file.updated_at = timezone.now()
    file.save(update_fields=['updated_at'])
    return file


def file_convert_to_pdf(*, file_id: int, user=None) -> models.File:
    file = models.File.objects.get(pk=file_id)

    if file.is_encrypted and user:
        raw_content = decrypt_file_content(file, user)
        content = raw_content.decode('utf-8')
    else:
        with default_storage.open(file.location, 'r') as stored_file:
            content = stored_file.read()

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    text_object = pdf.beginText(40, 800)
    text_object.setFont('Courier', 11)

    for raw_line in content.splitlines() or ['']:
        line = raw_line
        while len(line) > 95:
            text_object.textLine(line[:95])
            line = line[95:]
            if text_object.getY() <= 40:
                pdf.drawText(text_object)
                pdf.showPage()
                text_object = pdf.beginText(40, 800)
                text_object.setFont('Courier', 11)

        text_object.textLine(line)
        if text_object.getY() <= 40:
            pdf.drawText(text_object)
            pdf.showPage()
            text_object = pdf.beginText(40, 800)
            text_object.setFont('Courier', 11)

    pdf.drawText(text_object)
    pdf.save()

    pdf_name = f"{file.name.rsplit('.', 1)[0]}.pdf"
    pdf_content = ContentFile(buffer.getvalue())
    user_folder = file.location.rsplit('/', 1)[0] if '/' in file.location else ''
    pdf_location = default_storage.save(f"{user_folder}/{pdf_name}" if user_folder else pdf_name, pdf_content)

    new_file = models.File(
        name=pdf_name,
        location=pdf_location,
        added_at=timezone.now(),
        updated_at=timezone.now(),
        folder_id=file.folder_id,
    )
    new_file.save()
    buffer.close()

    if file.is_encrypted and user:
        new_file = encrypt_file(new_file, user)

    return new_file

