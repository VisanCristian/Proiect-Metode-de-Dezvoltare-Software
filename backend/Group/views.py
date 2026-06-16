from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from FlashCards.models import Deck
from FileTree.models import File
from .models import Group, GroupDeck, GroupFile
from . import serializers, selectors, services, models

class GroupCreateApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = serializers.GroupCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            group = services.group_create(name=serializer.validated_data['name'], owner_id=request.user.id)
            return Response({'id': group.id, 'name': group.name, 'token': group.token}, status=status.HTTP_201_CREATED)
        except ValidationError as exc:
            return Response({'message': 'Group creation failed.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while creating the group.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupListApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            groups = selectors.get_user_groups(user_id=request.user.id)
            return Response({'contents': [{'id': g.id, 'name': g.name, 'token': g.token, 'owner': g.owner} for g in groups]}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'An unexpected error occurred while loading groups.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupJoinApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = serializers.GroupJoinSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            group = services.group_join(token=serializer.validated_data['token'], user_id=request.user.id)
            return Response({'id': group.id, 'name': group.name, 'token': group.token}, status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Failed to join group.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while joining the group.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupLeaveApi(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            serializer = serializers.GroupLeaveSerializer(data=request.query_params)
            serializer.is_valid(raise_exception=True)
            group_id = serializer.validated_data.get('id')
            services.group_leave(group_id=group_id, user_id=request.user.id)
            return Response(status=status.HTTP_200_OK)
        except ValidationError as exc:
            return Response({'message': 'Leaving group failed.', 'errors': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An unexpected error occurred while leaving the group.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupDetailApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        try:
            if not models.UserGroup.objects.filter(group_id=group_id, user_id=request.user.id).exists():
                return Response({'message': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)
            group = selectors.get_group_by_id(group_id=group_id)
            serializer = serializers.GroupDetailSerializer(group, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GroupShareDeckApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        deck_id = request.data.get('deck_id')
        if not deck_id:
            return Response({"message": "deck_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not models.UserGroup.objects.filter(group_id=group_id, user_id=request.user.id).exists():
            return Response({'message': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        deck = get_object_or_404(Deck, id=deck_id, user=request.user)
        group = get_object_or_404(Group, id=group_id)
        GroupDeck.objects.get_or_create(group=group, deck=deck)
        
        return Response({"message": "Deck shared with group successfully."}, status=status.HTTP_201_CREATED)

class GroupShareFileApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        file_id = request.data.get('file_id')
        if not file_id:
            return Response({"message": "file_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not models.UserGroup.objects.filter(group_id=group_id, user_id=request.user.id).exists():
            return Response({'message': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        file = get_object_or_404(File, id=file_id, folder__user=request.user)
        group = get_object_or_404(Group, id=group_id)
        GroupFile.objects.get_or_create(group=group, file=file)
        
        return Response({"message": "File shared with group successfully."}, status=status.HTTP_201_CREATED)

class GroupMembersStatsApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        try:
            if not models.UserGroup.objects.filter(group_id=group_id, user_id=request.user.id).exists():
                return Response({'message': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)
            data = selectors.get_group_members_activity(group_id=group_id)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GroupUnshareDeckApi(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, group_id):
        deck_id = request.query_params.get('deck_id')
        if not deck_id:
            return Response({"message": "deck_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not models.UserGroup.objects.filter(group_id=group_id, user_id=request.user.id).exists():
            return Response({'message': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        group = get_object_or_404(Group, id=group_id)
        instance = GroupDeck.objects.filter(group=group, deck_id=deck_id).first()
        if not instance:
            return Response({"message": "Deck not found in this group."}, status=status.HTTP_404_NOT_FOUND)

        if instance.deck.user != request.user and group.owner != request.user.id:
            return Response({"message": "Not authorized to unshare this deck."}, status=status.HTTP_403_FORBIDDEN)

        instance.delete()
        return Response({"message": "Deck unshared successfully."}, status=status.HTTP_200_OK)

class GroupUnshareFileApi(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, group_id):
        file_id = request.query_params.get('file_id')
        if not file_id:
            return Response({"message": "file_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not models.UserGroup.objects.filter(group_id=group_id, user_id=request.user.id).exists():
            return Response({'message': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        group = get_object_or_404(Group, id=group_id)
        instance = GroupFile.objects.filter(group=group, file_id=file_id).first()
        if not instance:
            return Response({"message": "File not found in this group."}, status=status.HTTP_404_NOT_FOUND)

        if instance.file.folder.user != request.user and group.owner != request.user.id:
            return Response({"message": "Not authorized to unshare this file."}, status=status.HTTP_403_FORBIDDEN)

        instance.delete()
        return Response({"message": "File unshared successfully."}, status=status.HTTP_200_OK)
