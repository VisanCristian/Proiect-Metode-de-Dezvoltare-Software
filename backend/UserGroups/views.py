from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from .models import UserGroup, GroupDeck, GroupFile
from .serializers import UserGroupSerializer
from FlashCards.models import Deck
from FileTree.models import File

class UserGroupViewSet(viewsets.ModelViewSet):
    serializer_class = UserGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    # if we do not filter the queryset, any user could see all the groups in the data base
    def get_queryset(self):
        return UserGroup.objects.filter(Q(owner=self.request.user) | Q(members=self.request.user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        group = self.get_object()
        if group.owner != request.user:
            return Response({"detail": "Only the owner can edit the group."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        group = self.get_object()
        if group.owner != request.user:
            return Response({"detail": "Only the owner can delete the group."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        if group.owner != request.user:
            return Response({"detail": "Only the owner can add members."}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, id=user_id)
        group.members.add(user)
        return Response({"detail": f"User {user.username} added to the group."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        group = self.get_object()
        if group.owner != request.user:
            return Response({"detail": "Only the owner can remove members."}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)
        if user == group.owner:
            return Response({"detail": "Owner cannot be removed from the group."}, status=status.HTTP_400_BAD_REQUEST)
            
        group.members.remove(user)
        return Response({"detail": f"User {user.username} removed from the group."}, status=status.HTTP_200_OK)

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

        file = get_object_or_404(File, id=file_id, folder__user=request.user)
        GroupFile.objects.get_or_create(group=group, file=file)
        return Response({"detail": "File shared with group successfully."}, status=status.HTTP_201_CREATED)
