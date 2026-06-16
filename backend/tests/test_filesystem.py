import pytest
import io
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from FileTree.models import Folder, File
from django.core.files.uploadedfile import SimpleUploadedFile

@pytest.fixture
def auth_client():
    client = APIClient()
    user = User.objects.create_user(username='fileuser', password='password123')
    client.force_authenticate(user=user)
    return client, user

@pytest.mark.django_db
def test_upload_file(auth_client):
    """
    Verifică dacă un fișier este încărcat corect în sistemul de fișiere.
    """
    client, user = auth_client
    folder = Folder.objects.create(user=user.id, name='Test Folder')
    
    url = '/api/filesystem/files/add'
    file_content = b"Content for testing upload"
    test_file = SimpleUploadedFile("test.txt", file_content, content_type="text/plain")
    
    data = {
        'file': test_file,
        'folderId': folder.id,
        'encrypt': 'false'
    }
    
    response = client.post(url, data, format='multipart')
    assert response.status_code == status.HTTP_201_CREATED
    assert File.objects.filter(name='test.txt', folder_id=folder.id).exists()

@pytest.mark.django_db
def test_pdf_metadata_reading():
    """
    Verifică citirea metadata dintr-un PDF folosind pdfplumber.
    (Simulează funcționalitatea cerută de utilizator)
    """
    import pdfplumber
    from reportlab.pdfgen import canvas
    
    # Create a small PDF
    packet = io.BytesIO()
    can = canvas.Canvas(packet)
    can.setAuthor("Test Author")
    can.setTitle("Test PDF")
    can.drawString(100, 100, "Hello PDF")
    can.save()
    packet.seek(0)
    
    with pdfplumber.open(packet) as pdf:
        metadata = pdf.metadata
        assert metadata['Author'] == "Test Author"
        assert metadata['Title'] == "Test PDF"
        assert "Hello PDF" in pdf.pages[0].extract_text()
