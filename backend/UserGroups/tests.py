from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from FlashCards.models import Deck
from FileTree.models import File, Folder
from .models import UserGroup, GroupDeck, GroupFile


class UserGroupApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username="owner", password="pass12345")
        self.member = User.objects.create_user(username="member", password="pass12345")
        self.folder = Folder.objects.create(user=self.owner.id, name="Docs")
        self.file = File.objects.create(
            name="Notes.txt",
            location="/docs/notes.txt",
            added_at=date.today(),
            updated_at=date.today(),
            folder=self.folder,
        )
        self.deck = Deck.objects.create(user=self.owner, title="Biology", description="Shared deck")
        self.client.force_authenticate(user=self.owner)

    def test_create_group_can_store_members_decks_and_files(self):
        response = self.client.post(
            "/api/groups/",
            {
                "name": "Study team",
                "description": "Group for exam prep",
                "member_identifiers": [str(self.member.id)],
                "deck_ids": [self.deck.id],
                "file_ids": [self.file.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        group = UserGroup.objects.get(name="Study team")
        self.assertEqual(group.owner, self.owner)
        self.assertSetEqual(set(group.members.values_list("id", flat=True)), {self.owner.id, self.member.id})
        self.assertTrue(GroupDeck.objects.filter(group=group, deck=self.deck).exists())
        self.assertTrue(GroupFile.objects.filter(group=group, file=self.file).exists())

    def test_create_group_can_store_members_by_username(self):
        response = self.client.post(
            "/api/groups/",
            {
                "name": "Username team",
                "member_identifiers": [self.member.username],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        group = UserGroup.objects.get(name="Username team")
        self.assertIn(self.member, group.members.all())
