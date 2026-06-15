from rest_framework import serializers
from .models import Group

class GroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

class GroupJoinSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=64)

    def validate_token(self, value):
        if not Group.objects.filter(token=value).exists():
            raise serializers.ValidationError("Group with this token does not exist.")
        return value

class GroupLeaveSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not Group.objects.filter(id=value).exists():
            raise serializers.ValidationError("Group with this ID does not exist.")
        return value
