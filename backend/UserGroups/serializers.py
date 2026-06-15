from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserGroup, GroupDeck, GroupFile
from FlashCards.serializers import DeckSerializer
from FlashCards.models import Deck
from FileTree.models import File
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
    shared_decks_detail = GroupDeckSerializer(source='shared_decks', many=True, read_only=True)
    shared_files_detail = GroupFileSerializer(source='shared_files', many=True, read_only=True)
    
    #PrimaryKeyRelatedField => an arrayjust with the ids of the related ojects
    
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), # is for validation, to ensure that we are looking for valid users
        many=True, #we want an array of user_ids not just one (Default = False)
        required=False,
        write_only=True 
    )
    
    deck_ids = serializers.PrimaryKeyRelatedField(
        queryset=Deck.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )
    
    file_ids = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = UserGroup
        fields = ['id', 'name', 'description', 
                  'owner', 'owner_detail', 
                  'members', 'members_detail', 
                  'member_ids', 'deck_ids', 'file_ids',
                  'shared_decks_detail', 'shared_files_detail',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'members', 'created_at', 'updated_at']

    def create(self, validated_data):
    
        request = self.context.get('request')
        if request is None or not getattr(request, 'user', None) or not request.user.is_authenticated:
            raise serializers.ValidationError({'detail': 'Authentication is required.'})

        member_ids = validated_data.pop('member_ids', [])
        deck_ids = validated_data.pop('deck_ids', [])
        file_ids = validated_data.pop('file_ids', [])

        if any(deck.user_id != request.user.id for deck in deck_ids):
            raise serializers.ValidationError({'deck_ids': 'You can only share your own decks.'})

        if any(shared_file.folder.user_id != request.user.id for shared_file in file_ids):
            raise serializers.ValidationError({'file_ids': 'You can only share your own files.'})
    
        # transition.atomic() => if any error occurs during the creation of the group, all changes will be rolled back and no partial data will be saved to the database
        with transaction.atomic():
            group = UserGroup.objects.create(owner=request.user, **validated_data)
            group.members.add(request.user)

            if member_ids   :
                group.members.add(*member_ids) #we add the owner as a memeber by defauult + the other member that we want to add

            for deck in deck_ids:
                GroupDeck.objects.get_or_create(group=group, deck=deck) 

            for shared_file in file_ids:
                GroupFile.objects.get_or_create(group=group, file=shared_file)

        return UserGroup.objects.prefetch_related(
            'members', 'shared_decks', 'shared_files', 'owner',
            'shared_decks__deck', 'shared_files__file'
        ).get(pk=group.pk)

# prefetch_related => we interogate the database only once to get all the data 
    # "i want the group, but give me all the infromation you have about the memebrs/decks/files/owner 
    # in the same query, so that i do not have to make different interogation for each of them"