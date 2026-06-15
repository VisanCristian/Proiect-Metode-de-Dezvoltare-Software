from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.models import User, Group # Adaugat Group
from .models import GroupDeck, GroupFile # Scoatere UserGroup (e comentat in models)
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
    # owner_detail = UserSerializer(source='owner', read_only=True)
    # members_detail = UserSerializer(source='members', many=True, read_only=True)
    shared_decks_detail = GroupDeckSerializer(source='shared_decks', many=True, read_only=True)
    shared_files_detail = GroupFileSerializer(source='shared_files', many=True, read_only=True)
    
    decks = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    # is_owner = serializers.SerializerMethodField()
    
    # member_ids = serializers.PrimaryKeyRelatedField(
    #     queryset=User.objects.all(),
    #     many=True,
    #     required=False,
    #     write_only=True 
    # )
    
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
        model = Group # Schimbat din UserGroup in Group
        fields = ['id', 'name', 
                  # 'description', 'owner', 'owner_detail', 'is_owner',
                  # 'members', 'members_detail', 'member_ids', 
                  'deck_ids', 'file_ids',
                  'decks', 'files',
                  'shared_decks_detail', 'shared_files_detail']
        read_only_fields = ['id']

    # def get_is_owner(self, obj):
    #     request = self.context.get('request')
    #     return obj.owner == request.user if request else False

    def get_decks(self, obj):
        # Returnăm lista de pachete (vectorul plat)
        return DeckSerializer([sd.deck for sd in obj.shared_decks.all()], many=True).data

    def get_files(self, obj):
        # Returnăm lista de fișiere (vectorul plat)
        return FileSerializer([sf.file for sf in obj.shared_files.all()], many=True).data

    def create(self, validated_data):
    
        request = self.context.get('request')
        if request is None or not getattr(request, 'user', None) or not request.user.is_authenticated:
            raise serializers.ValidationError({'detail': 'Authentication is required.'})

        # member_ids = validated_data.pop('member_ids', [])
        deck_ids = validated_data.pop('deck_ids', [])
        file_ids = validated_data.pop('file_ids', [])
        
        # Pop owner if it exists in validated_data
        # owner = validated_data.pop('owner', request.user)

        if any(deck.user_id != request.user.id for deck in deck_ids):
            raise serializers.ValidationError({'deck_ids': 'You can only share your own decks.'})

        if any(shared_file.folder.user != request.user.id for shared_file in file_ids):
            raise serializers.ValidationError({'file_ids': 'You can only share your own files.'})
    
        with transaction.atomic():
            group = Group.objects.create(**validated_data)
            group.user_set.add(request.user) # Adaugam userul in grupul standard

            # if member_ids   :
            #     group.members.add(*member_ids)

            for deck in deck_ids:
                GroupDeck.objects.get_or_create(group=group, deck=deck) 

            for shared_file in file_ids:
                GroupFile.objects.get_or_create(group=group, file=shared_file)

        return Group.objects.prefetch_related(
            'user_set', 'shared_decks', 'shared_files',
            'shared_decks__deck', 'shared_files__file'
        ).get(pk=group.pk)

# prefetch_related => we interogate the database only once to get all the data 
    # "i want the group, but give me all the infromation you have about the memebrs/decks/files/owner 
    # in the same query, so that i do not have to make different interogation for each of them"