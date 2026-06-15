from rest_framework import serializers
from .models import Group, GroupDeck, GroupFile
from FlashCards.serializers import DeckSerializer
from FileTree.serializers import FileSerializer

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

class GroupDeckSerializer(serializers.ModelSerializer):
    deck_details = DeckSerializer(source='deck', read_only=True)
    owner = serializers.SerializerMethodField()

    class Meta:
        model = GroupDeck
        fields = ['id', 'deck', 'deck_details', 'owner', 'added_at', 'updated_at']

    def get_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.deck.user_id == request.user.id or obj.group.owner == request.user.id
        return False

class GroupFileSerializer(serializers.ModelSerializer):
    file_details = FileSerializer(source='file', read_only=True)
    owner = serializers.SerializerMethodField()

    class Meta: 
        model = GroupFile
        fields = ['id', 'file', 'file_details', 'owner', 'added_at', 'updated_at']

    def get_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.file.folder.user == request.user.id or obj.group.owner == request.user.id
        return False

class GroupDetailSerializer(serializers.ModelSerializer):
    shared_decks_detail = GroupDeckSerializer(source='shared_decks', many=True, read_only=True)
    shared_files_detail = GroupFileSerializer(source='shared_files', many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'token', 'owner', 'shared_decks_detail', 'shared_files_detail']
