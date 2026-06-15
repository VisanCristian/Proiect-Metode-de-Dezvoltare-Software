from django.db import models
from FlashCards.models import Deck
from FileTree.models import File

class Group(models.Model):
    name = models.CharField(max_length=255)
    token = models.CharField(max_length=64, unique=True)
    owner = models.IntegerField()  # user_id of the creator

class UserGroup(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user_id = models.IntegerField()  # user_id of the member

class GroupDeck(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='shared_decks')
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('group', 'deck')
        
class GroupFile(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='shared_files')
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('group', 'file')
