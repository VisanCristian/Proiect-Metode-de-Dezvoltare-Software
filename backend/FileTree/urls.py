from django.urls import path
from . import views

urlpatterns = [
    path('folders/create', views.FolderCreateApi.as_view(), name='create-folder'),
    path('folders', views.FolderListApi.as_view(), name='list-folder-contents'),
    path('folders/list', views.FileListApi.as_view(), name='list-files'),
    path('folders/remove', views.FolderRemoveApi.as_view(), name='remove-folder'),
    path('files/add', views.FileAddApi.as_view(), name='add-file'),
    path('files/content', views.FileContentApi.as_view(), name='file-content'),
    path('files/update', views.FileUpdateApi.as_view(), name='update-file'),
    path('files/export', views.FileExportApi.as_view(), name='export-file'),
    path('files/convert-pdf', views.FileConvertToPdfApi.as_view(), name='convert-file-pdf'),
    path('files/remove', views.FileRemoveApi.as_view(), name='remove-file'),
]
