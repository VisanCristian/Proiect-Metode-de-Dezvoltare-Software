
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import PomodoroPermission
from .selectors import (
    get_current_session,
    get_or_create_draft_session,
    get_session_by_id,
    get_task_by_id,
    list_sessions,
    list_tasks,
)
from .serializers import (
    PomodoroSessionCreateSerializer,
    PomodoroSessionFinishSerializer,
    PomodoroSessionSerializer,
    PomodoroSessionSettingsSerializer,
    PomodoroTaskReorderSerializer,
    PomodoroTaskSerializer,
    PomodoroTaskUpdateSerializer,
)
from .services import (
    abandon_session,
    clear_sessions,
    create_session,
    create_task,
    delete_task,
    finish_session,
    reorder_tasks,
    start_session,
    update_session_settings,
    update_task,
)


def _request_user(request):
    return request.user if request.user.is_authenticated else None


class PomodoroCurrentSessionView(APIView):
    permission_classes = [PomodoroPermission]

    def get(self, request):
        user = _request_user(request)
        session = get_current_session(user=user)
        if session is None:
            session = get_or_create_draft_session(user=user)
        serializer = PomodoroSessionSerializer(session)
        return Response(serializer.data)


class PomodoroTaskListCreateView(APIView):
    permission_classes = [PomodoroPermission]

    def get(self, request):
        user = _request_user(request)
        session_id = request.query_params.get('session_id')
        tasks = list_tasks(session_id=session_id, user=user)
        serializer = PomodoroTaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = _request_user(request)
        serializer = PomodoroTaskUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = create_task(serializer.validated_data, user=user)
        return Response(PomodoroTaskSerializer(task).data, status=status.HTTP_201_CREATED)


class PomodoroTaskDetailView(APIView):
    permission_classes = [PomodoroPermission]

    def patch(self, request, task_id):
        user = _request_user(request)
        task = get_task_by_id(task_id, user=user)
        if task is None:
            raise Http404('Task not found.')
        serializer = PomodoroTaskUpdateSerializer(instance=task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        task = update_task(task, serializer.validated_data)
        return Response(PomodoroTaskSerializer(task).data)

    def delete(self, request, task_id):
        user = _request_user(request)
        task = get_task_by_id(task_id, user=user)
        if task is None:
            raise Http404('Task not found.')
        delete_task(task)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PomodoroTaskReorderView(APIView):
    permission_classes = [PomodoroPermission]

    def post(self, request):
        serializer = PomodoroTaskReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reorder_tasks(serializer.validated_data['tasks'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class PomodoroSessionListCreateView(APIView):
    permission_classes = [PomodoroPermission]

    def get(self, request):
        user = _request_user(request)
        sessions = list_sessions(user=user)
        serializer = PomodoroSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = _request_user(request)
        serializer = PomodoroSessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = create_session(serializer.validated_data, user=user)
        return Response(PomodoroSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class PomodoroSessionDetailView(APIView):
    permission_classes = [PomodoroPermission]

    def get(self, request, session_id):
        user = _request_user(request)
        session = get_session_by_id(session_id, user=user)
        if session is None:
            raise Http404('Session not found.')
        return Response(PomodoroSessionSerializer(session).data)

    def patch(self, request, session_id):
        user = _request_user(request)
        session = get_session_by_id(session_id, user=user)
        if session is None:
            raise Http404('Session not found.')

        requested_status = request.data.get('status')
        if requested_status in {'ended', 'abandoned'}:
            serializer = PomodoroSessionFinishSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            if serializer.validated_data.get('status') == 'abandoned':
                session = abandon_session(session, serializer.validated_data)
            else:
                session = finish_session(session, serializer.validated_data)
        else:
            serializer = PomodoroSessionSettingsSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            session = update_session_settings(session, serializer.validated_data)

        return Response(PomodoroSessionSerializer(session).data)


class PomodoroSessionStartView(APIView):
    permission_classes = [PomodoroPermission]

    def post(self, request, session_id):
        user = _request_user(request)
        session = get_session_by_id(session_id, user=user)
        if session is None:
            raise Http404('Session not found.')
        session = start_session(session)
        return Response(PomodoroSessionSerializer(session).data)


class PomodoroSessionClearView(APIView):
    permission_classes = [PomodoroPermission]

    def delete(self, request):
        user = _request_user(request)
        clear_sessions(user=user)
        return Response(status=status.HTTP_204_NO_CONTENT)
