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
                "member_ids": [self.member.id],
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
                "member_ids": [self.member.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        group = UserGroup.objects.get(name="Username team")
        self.assertIn(self.member, group.members.all())

    def test_cannot_share_others_deck(self):
        other_user = User.objects.create_user(username="other", password="pass12345")
        other_deck = Deck.objects.create(user=other_user, title="Other Deck")
        
        response = self.client.post(
            "/api/groups/",
            {
                "name": "Evil team",
                "deck_ids": [other_deck.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("deck_ids", response.data)

    def test_cannot_share_others_file(self):
        other_user = User.objects.create_user(username="other", password="pass12345")
        other_folder = Folder.objects.create(user=other_user.id, name="Other Folder")
        other_file = File.objects.create(
            name="Secret.txt",
            location="/docs/secret.txt",
            added_at=date.today(),
            updated_at=date.today(),
            folder=other_folder,
        )
        
        response = self.client.post(
            "/api/groups/",
            {
                "name": "Evil team",
                "file_ids": [other_file.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("file_ids", response.data)

    def test_unshare_file_success(self):
        group = UserGroup.objects.create(owner=self.owner, name="Test Group")
        GroupFile.objects.create(group=group, file=self.file)
        
        response = self.client.post(
            f"/api/groups/{group.id}/unshare_file/",
            {"file_id": self.file.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(GroupFile.objects.filter(group=group, file=self.file).exists())

    def test_unshare_unauthorized(self):
        # User is a member but NOT the owner and NOT the file provider
        group = UserGroup.objects.create(owner=self.owner, name="Test Group")
        group.members.add(self.member)
        GroupFile.objects.create(group=group, file=self.file)
        
        self.client.force_authenticate(user=self.member)
        response = self.client.post(
            f"/api/groups/{group.id}/unshare_file/",
            {"file_id": self.file.id},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertTrue(GroupFile.objects.filter(group=group, file=self.file).exists())
