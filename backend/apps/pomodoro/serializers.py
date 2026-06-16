from django.utils import timezone
from rest_framework import serializers

from .models import PomodoroSession, PomodoroTask


class PomodoroTaskSerializer(serializers.ModelSerializer):
    session_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = PomodoroTask
        fields = (
            'id',
            'session_id',
            'title',
            'estimated_pomodoros',
            'actual_pomodoros',
            'completed',
            'display_order',
            'created_at',
            'updated_at',
        )


class PomodoroTaskUpdateSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    session_id = serializers.UUIDField(required=False)
    title = serializers.CharField(required=False, allow_blank=False, max_length=255)
    estimated_pomodoros = serializers.IntegerField(required=False, min_value=1)
    actual_pomodoros = serializers.IntegerField(required=False, min_value=0)
    completed = serializers.BooleanField(required=False)
    display_order = serializers.IntegerField(required=False, min_value=0)

    def validate(self, attrs):
        session_id = attrs.pop('session_id', None)
        if session_id is not None:
            session = PomodoroSession.objects.filter(id=session_id).first()
            if session is None:
                raise serializers.ValidationError({'session_id': 'Session not found.'})
            attrs['session'] = session
        if self.instance is None and 'title' not in attrs:
            raise serializers.ValidationError({'title': 'This field is required.'})
        return attrs


class PomodoroTaskReorderItemSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    display_order = serializers.IntegerField(min_value=0)


class PomodoroTaskReorderSerializer(serializers.Serializer):
    tasks = PomodoroTaskReorderItemSerializer(many=True)


class PomodoroSessionSerializer(serializers.ModelSerializer):
    tasks = PomodoroTaskSerializer(many=True, read_only=True)

    class Meta:
        model = PomodoroSession
        fields = (
            'id',
            'start_time',
            'end_time',
            'status',
            'focus_time',
            'break_time',
            'long_break_time',
            'cycles_before_long_break',
            'auto_start',
            'total_focus_time',
            'total_break_time',
            'completed_pomodoros',
            'points',
            'created_at',
            'updated_at',
            'tasks',
        )


class PomodoroSessionCreateSerializer(serializers.Serializer):
    focus_time = serializers.IntegerField(required=False, min_value=1)
    break_time = serializers.IntegerField(required=False, min_value=1)
    long_break_time = serializers.IntegerField(required=False, min_value=1)
    cycles_before_long_break = serializers.IntegerField(required=False, min_value=1)
    auto_start = serializers.BooleanField(required=False)


class PomodoroSessionSettingsSerializer(serializers.Serializer):
    focus_time = serializers.IntegerField(required=False, min_value=1)
    break_time = serializers.IntegerField(required=False, min_value=1)
    long_break_time = serializers.IntegerField(required=False, min_value=1)
    cycles_before_long_break = serializers.IntegerField(required=False, min_value=1)
    auto_start = serializers.BooleanField(required=False)


class PomodoroSessionFinishSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[PomodoroSession.Status.ENDED, PomodoroSession.Status.ABANDONED])
    start_time = serializers.DateTimeField(required=False)
    end_time = serializers.DateTimeField(required=False)
    total_focus_time = serializers.IntegerField(required=False, min_value=0)
    total_break_time = serializers.IntegerField(required=False, min_value=0)
    completed_pomodoros = serializers.IntegerField(required=False, min_value=0)
    points = serializers.IntegerField(required=False, min_value=0)

    def validate(self, attrs):
        if attrs.get('status') == PomodoroSession.Status.ENDED and 'end_time' not in attrs:
            attrs['end_time'] = timezone.now()
        if attrs.get('status') == PomodoroSession.Status.ABANDONED and 'end_time' not in attrs:
            attrs['end_time'] = timezone.now()
        return attrs
