from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User, Group # Adaugat Group
from .models import GroupDeck, GroupFile # Scoatere UserGroup (e comentat in models)
from .serializers import UserGroupSerializer
from FlashCards.models import Deck
from FileTree.models import File

class UserGroupViewSet(viewsets.ModelViewSet):
    serializer_class = UserGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.groups.all() 

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, id=user_id)
        group.user_set.add(user) 
        return Response({"detail": f"User {user.username} added to the group."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        group.user_set.remove(user)
        return Response({"detail": f"User {user.username} removed from the group."}, status=status.HTTP_200_OK)

    # Helper function to unshare a resource (deck or file) from the group
    def _unshare_resource(self, request, pk, model, resource_field, resource_name):
        group = self.get_object()
        resource_id = request.data.get(f"{resource_field}_id")
        
        if not resource_id:
            return Response(
                {"detail": f"{resource_field}_id is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        lookup = {"group": group, f"{resource_field}_id": resource_id}
        instance = model.objects.filter(**lookup).first()

        if not instance:
            return Response(
                {"detail": f"{resource_name} not found in this group."},
                status=status.HTTP_404_NOT_FOUND
            )

        instance.delete()
        return Response(
            {"detail": f"{resource_name} unshared successfully."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def unshare_deck(self, request, pk=None):
        return self._unshare_resource(
            request, pk,
            model=GroupDeck,
            resource_field='deck',
            resource_name='Deck'
        )

    @action(detail=True, methods=['post'])
    def unshare_file(self, request, pk=None):
        return self._unshare_resource(
            request, pk,
            model=GroupFile,
            resource_field='file',
            resource_name='File'
        )

    @action(detail=True, methods=['post'])
    def share_deck(self, request, pk=None):
        group = self.get_object()
        deck_id = request.data.get('deck_id')
        if not deck_id:
            return Response({"detail": "deck_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        deck = get_object_or_404(Deck, id=deck_id, user=request.user)
        GroupDeck.objects.get_or_create(group=group, deck=deck)
        
        return Response({"detail": "Deck shared with group successfully."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def share_file(self, request, pk=None):
        group = self.get_object()
        file_id = request.data.get('file_id')
        if not file_id:
            return Response({"detail": "file_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        file = get_object_or_404(File, id=file_id, folder__user=request.user.id)
        GroupFile.objects.get_or_create(group=group, file=file)
        return Response({"detail": "File shared with group successfully."}, status=status.HTTP_201_CREATED)
