from django.shortcuts import get_object_or_404
from .models import File,Folder

def get_file(*, file_id:int) -> File:
    return get_object_or_404(File, pk=file_id)

def get_folders(*, user_id:int) -> Folder:
    return Folder.objects.filter(user=user_id)

def get_folder_contents(*, folder_id: int):
    return File.objects.filter(folder=folder_id)

def get_file_content(*, file_id: int):
    return get_object_or_404(File, pk=file_id)
