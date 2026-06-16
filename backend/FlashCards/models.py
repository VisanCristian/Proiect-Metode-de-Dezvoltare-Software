from django.db import models 
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from FileTree.models import File

class Deck(models.Model):
    # each deck (set of flashcards) belongs to a user and can contain multiple flashcards.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='decks')
    title = models.CharField(max_length=255, help_text="Name of the flashcard set")
    description = models.TextField(blank=True, null=True, help_text="Description of the set")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    source_file = models.ForeignKey(File, on_delete=models.SET_NULL, null=True, blank=True, related_name='related_decks')
    
    
    class Meta:
        ordering = ['-created_at'] 
        verbose_name_plural = "Decks"

    def __str__(self):
        return f"{self.title} (by {self.user.username})"
   
class Flashcard(models.Model):
    #Flashcardurile individuale cu întrebare și răspuns. Apartine unui deck

    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='flashcards')
    question = models.CharField(max_length=500, help_text="Question text")
    answer = models.TextField(help_text="Answer text")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.deck.title}] {self.question[:50]}..."
    
class UserCardProgress(models.Model):
    # The progress of the user for ecah card. Status can be: 'known', 'unknown', 'unanswered'.
    # The combination (user, card) is unique - a user cannot have 2 progress entries for the same card.
 
    status_choices = (
        ('known', 'Known'),
        ('unknown', 'Unknown'),
        ('unanswered', 'Unanswered'),
    )
  
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='card_progress')
    card = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='progress_entries')
    status = models.CharField(max_length=20, choices=status_choices, default='unanswered')
    last_reviewed = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
        models.UniqueConstraint(fields=['user', 'card'], name='unique_user_card_progress')
    ]
    verbose_name_plural = "User Card Progress"

    def __str__(self):
        return f"{self.user.username} - {self.card.question[:30]}... ({self.status})"


class SourceDocument(models.Model):
    #Documents uploaded by the user.
    #Link to the deck from which the cards were generated.
   
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='source_documents')
    file = models.FileField(
        upload_to='source_pdfs/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])],
        help_text="PDF file to upload"
    )
    file_name = models.CharField(max_length=255, editable=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name_plural = "Source Documents"

    def __str__(self):
        return f"{self.deck.title} - {self.file_name}"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_name = self.file.name
        super().save(*args, **kwargs)

class DeckSession(models.Model):
    # Records a completed study session for a deck
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deck_sessions', null=True, blank=True)
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='sessions')
    date = models.DateField(auto_now_add=True)
    mistakes = models.IntegerField(default=0)
    responses = models.IntegerField(default=0)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.deck.title} session on {self.date}"
