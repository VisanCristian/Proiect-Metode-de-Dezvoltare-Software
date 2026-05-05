from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from . import serializers, selectors, services

# Create your views here.

class FolderCreateApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = serializers.FolderCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            folder = services.folder_create(folder_name=serializer.validated_data['name'], user_id=request.user.id)
            return Response({'id': folder.id}, status=status.HTTP_201_CREATED)
        except ValidationError as exc:
            return Response({'message': 'Folder creation failed.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while creating the folder.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FolderListApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            folders = selectors.get_folders(user_id=request.user.id)
            return Response({'contents': [{'id': f.id, 'name': f.name} for f in folders]}, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Could not load folders.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while loading folders.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FolderRemoveApi(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            serializer = serializers.FolderRemoveSerializer(data=request.query_params)
            serializer.is_valid(raise_exception=True)
            folder_id = serializer.validated_data.get('id')
            services.folder_remove(folder_id=folder_id)
            return Response(status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Folder deletion failed.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while deleting the folder.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileListApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            folder_id = request.query_params.get('id')
            serializer = serializers.FileListSerializer(data={'id': folder_id})
            serializer.is_valid(raise_exception=True)
            files = selectors.get_folder_contents(folder_id=folder_id)
            return Response({'contents': [{'id': f.id, 'name': f.name, 'type': services.get_file_type(f.name)} for f in files]}, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Could not load the folder files.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while loading folder files.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FileAddApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            file = request.FILES.get('file')
            folder_id = request.data.get('folderId')
            user_id = request.user.id
            serializer = serializers.FileAddSerializer(data={'file': file, 'folderId': folder_id, 'userId': user_id})
            serializer.is_valid(raise_exception=True)
            new_file = services.file_add(
                file=serializer.validated_data['file'],
                folder_id=serializer.validated_data['folderId'],
                user_id=serializer.validated_data['userId']
            )
            return Response({'id': new_file.id, 'name': new_file.name}, status=status.HTTP_201_CREATED)
        except ValidationError as exc:
            return Response({'message': 'File upload failed.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while adding the file.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class FileRemoveApi(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            file_id = request.query_params.get('id')
            serializer = serializers.FileRemoveSerializer(data={'id': file_id})
            serializer.is_valid(raise_exception=True)

            services.file_remove(file_id=serializer.validated_data['id'])
            return Response(status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'File deletion failed.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while deleting the file.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileContentApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            file_id = request.query_params.get('id')
            serializer = serializers.FileContentSerializer(data={'id': file_id})
            serializer.is_valid(raise_exception=True)
            file_data = services.file_get_content(file_id=serializer.validated_data['id'])
            return Response(file_data, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Could not load the file content.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while loading the file content.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileUpdateApi(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            serializer = serializers.FileUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            file = services.file_update(file_id=serializer.validated_data['id'], content=serializer.validated_data['content'])
            return Response({'id': file.id, 'name': file.name}, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Could not save the file changes.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while saving the file changes.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileExportApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            file_id = request.query_params.get('id')
            serializer = serializers.FileContentSerializer(data={'id': file_id})
            serializer.is_valid(raise_exception=True)
            file_data = services.file_get_content(file_id=serializer.validated_data['id'])
            return Response(file_data, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Could not export the file.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while exporting the file.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileConvertToPdfApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = serializers.FileConvertToPdfSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            new_file = services.file_convert_to_pdf(file_id=serializer.validated_data['id'])
            return Response({'id': new_file.id, 'name': new_file.name, 'type': services.get_file_type(new_file.name)}, status=status.HTTP_201_CREATED)
        except ValidationError as exc:
            return Response({'message': 'Could not convert the file to PDF.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while converting the file to PDF.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
