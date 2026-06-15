from rest_framework import serializers
from .models import File,Folder


def get_file_extension(file_name):
    if '.' not in file_name:
        return ''

    return file_name.rsplit('.', 1)[-1].lower()

class FolderCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

    def validate_name(self, value):
        if Folder.objects.filter(name=value).exists():
            raise serializers.ValidationError("A folder with this name already exists.")
        return value

class FolderListSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)

    def validate_id(self, value):
        if value and not Folder.objects.filter(id=value).exists():
            raise serializers.ValidationError("Folder with this ID does not exist.")
        return value

class FolderRemoveSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not Folder.objects.filter(id=value).exists():
            raise serializers.ValidationError("Folder with this ID does not exist.")
        return value

class FileListSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not Folder.objects.filter(id=value).exists():
            raise serializers.ValidationError("Folder with this ID does not exist.")
        return value

class FileAddSerializer(serializers.Serializer):
    file = serializers.FileField(allow_empty_file=True)
    folderId = serializers.IntegerField()
    userId = serializers.IntegerField(required=False, default=0)

    def validate_folderId(self, value):
        if not Folder.objects.filter(id=value).exists():
            raise serializers.ValidationError("Folder with this ID does not exist.")
        return value
    
    def validate_file(self, value):
        file_name = getattr(value, 'name', '')
        extension = get_file_extension(file_name)

        if not extension:
            raise serializers.ValidationError("Please upload only files ending in '.txt', '.md' or '.pdf'.")

        if extension not in ['txt', 'md', 'pdf']:
            raise serializers.ValidationError("Only files ending in '.txt', '.md' or '.pdf' are allowed.")
        return value

class FileRemoveSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not File.objects.filter(id=value).exists():
            raise serializers.ValidationError("File with this ID does not exist.")
        return value


class FileContentSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not File.objects.filter(id=value).exists():
            raise serializers.ValidationError("File with this ID does not exist.")
        return value


class FileUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    content = serializers.CharField()

    def validate_id(self, value):
        if not File.objects.filter(id=value).exists():
            raise serializers.ValidationError("File with this ID does not exist.")
        return value

    def validate(self, attrs):
        file = File.objects.get(id=attrs['id'])
        extension = get_file_extension(file.name)

        if extension == 'pdf':
            raise serializers.ValidationError("PDF files cannot be edited.")

        return attrs


class FileConvertToPdfSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not File.objects.filter(id=value).exists():
            raise serializers.ValidationError("File with this ID does not exist.")
        return value

    def validate(self, attrs):
        file = File.objects.get(id=attrs['id'])
        extension = get_file_extension(file.name)

        if extension != 'md':
            raise serializers.ValidationError("Only markdown files can be converted to PDF.")

        return attrs

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'
