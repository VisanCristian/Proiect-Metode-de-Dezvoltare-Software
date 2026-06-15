from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from . import serializers, selectors, services

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
