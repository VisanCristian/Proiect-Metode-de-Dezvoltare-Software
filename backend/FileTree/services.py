from . import models
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
import base64
from io import BytesIO
from reportlab.pdfgen import canvas


def get_file_extension(file_name: str) -> str:
    if '.' not in file_name:
        return ''

    return file_name.rsplit('.', 1)[-1].lower()


def get_file_type(file_name: str) -> str:
    extension = get_file_extension(file_name)

    if extension == 'pdf':
        return 'pdf'

    return 'text'

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

def file_add(*, file, folder_id, user_id):
    user_folder = "id_" + str(user_id)
    file_location = default_storage.save(f"{user_folder}/{file.name}", file)
    new_file = models.File(name=file.name, location=file_location, added_at=timezone.now(), updated_at=timezone.now(), folder_id=folder_id)
    new_file.save()
    return new_file

def file_remove(*, file_id: int) -> None:
    file = models.File.objects.get(pk=file_id)
    default_storage.delete(file.location)
    file.delete()


def file_get_content(*, file_id: int) -> dict:
    file = models.File.objects.get(pk=file_id)
    file_type = get_file_type(file.name)

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


def file_convert_to_pdf(*, file_id: int) -> models.File:
    file = models.File.objects.get(pk=file_id)

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
    return new_file
