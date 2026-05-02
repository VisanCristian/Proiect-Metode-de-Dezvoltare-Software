from rest_framework import serializers
from .models import Deck, Flashcard, UserCardProgress, SourceDocument

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = '__all__'

class DeckSerializer(serializers.ModelSerializer):
    cards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = Deck
        fields = ['id', 'user', 'title', 'description', 'created_at', 'updated_at', 'cards']

class UserCardProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCardProgress
        fields = '__all__'

class SourceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceDocument
        fields = '__all__'
        
