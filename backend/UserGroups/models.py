from django.db import models
from django.contrib.auth.models import User
from FlashCards.models import Deck 
from FileTree.models import File

class UserGroup (models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_groups')
    members = models.ManyToManyField(User, related_name ="user_groups")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
class GroupDeck(models.Model):
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE, related_name='shared_decks')
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('group', 'deck')
        
class GroupFile(models.Model):
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE, related_name='shared_files')
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('group', 'file')
                    
                    