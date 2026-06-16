from django.contrib.auth.models import User
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404

from apps.pomodoro.models import PomodoroSession
from FlashCards.models import DeckSession
from .models import Group, UserGroup


def get_user_groups(*, user_id: int):
    user_groups = UserGroup.objects.filter(user_id=user_id)
    group_ids = [ug.group_id for ug in user_groups]
    return Group.objects.filter(id__in=group_ids)

def get_group_by_token(*, token: str) -> Group:
    return get_object_or_404(Group, token=token)

def get_group_by_id(*, group_id: int) -> Group:
    return get_object_or_404(Group, id=group_id)

def get_group_members_activity(*, group_id: int):
    member_ids = list(
        UserGroup.objects.filter(group_id=group_id).values_list('user_id', flat=True)
    )
    users = User.objects.filter(id__in=member_ids).only('id', 'username')

    result = []
    for user in users:
        focus_rows = (
            PomodoroSession.objects
            .filter(user=user, status=PomodoroSession.Status.ENDED)
            .annotate(month=TruncMonth('start_time'))
            .values('month')
            .annotate(total_focus_time=Sum('total_focus_time'))
            .order_by('month')
        )

        cards_rows = (
            DeckSession.objects
            .filter(user=user)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total_solved_cards=Sum('responses'))
            .order_by('month')
        )

        focus_by_month = {
            row['month'].strftime('%Y-%m'): row['total_focus_time']
            for row in focus_rows
            if row['month'] is not None
        }
        cards_by_month = {
            row['month'].strftime('%Y-%m'): row['total_solved_cards']
            for row in cards_rows
            if row['month'] is not None
        }

        all_months = sorted(set(focus_by_month) | set(cards_by_month))
        monthly = [
            {
                'month': month,
                'total_focus_time': focus_by_month.get(month, 0),
                'total_solved_cards': cards_by_month.get(month, 0),
            }
            for month in all_months
        ]

        result.append({
            'user_id': user.id,
            'username': user.username,
            'monthly': monthly,
        })

    return result
