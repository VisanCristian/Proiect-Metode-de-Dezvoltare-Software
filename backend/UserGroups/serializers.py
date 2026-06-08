from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserGroup, GroupDeck, GroupFile
from FlashCards.serializers import DeckSerializer
from FileTree.serializers import FileSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class GroupDeckSerializer(serializers.ModelSerializer):
    deck_details = DeckSerializer(source='deck', read_only=True)
    class Meta:
        model = GroupDeck
        fields = ['id', 'deck', 'deck_details', 'added_at', 'updated_at']

class GroupFileSerializer(serializers.ModelSerializer):
    file_details = FileSerializer(source='file', read_only=True)
    class Meta: 
        model = GroupFile
        fields = ['id', 'file', 'file_details', 'added_at', 'updated_at']
        
class UserGroupSerializer(serializers.ModelSerializer):
    owner_detail = UserSerializer(source='owner', read_only=True)
    members_detail = UserSerializer(source='members', many=True, read_only=True)

    class Meta:
        model = UserGroup
        fields = ['id', 'name', 'description', 
                  'owner', 'owner_detail', 
                  'members', 'members_detail', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
