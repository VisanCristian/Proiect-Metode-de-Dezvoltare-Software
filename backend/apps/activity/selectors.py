from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone

from apps.pomodoro.models import PomodoroSession
from FlashCards.models import DeckSession
from Agents.models import FlashcardPointLog


def get_monthly_activity(user):
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

    flashcard_points_rows = (
        FlashcardPointLog.objects
        .filter(user=user)
        .annotate(month=TruncMonth('earned_at'))
        .values('month')
        .annotate(total_points=Sum('points'))
        .order_by('month')
    )

    pomodoro_points_rows = (
        PomodoroSession.objects
        .filter(user=user, status=PomodoroSession.Status.ENDED)
        .annotate(month=TruncMonth('start_time'))
        .values('month')
        .annotate(total_points=Sum('points'))
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
    flashcard_pts_by_month = {
        row['month'].strftime('%Y-%m'): row['total_points']
        for row in flashcard_points_rows
        if row['month'] is not None
    }
    pomodoro_pts_by_month = {
        row['month'].strftime('%Y-%m'): row['total_points']
        for row in pomodoro_points_rows
        if row['month'] is not None
    }

    all_months = sorted(
        set(focus_by_month) | set(cards_by_month) |
        set(flashcard_pts_by_month) | set(pomodoro_pts_by_month)
    )

    months = [
        {
            'month': month,
            'total_focus_time': focus_by_month.get(month, 0),
            'total_solved_cards': cards_by_month.get(month, 0),
            'flashcard_points': flashcard_pts_by_month.get(month, 0),
            'pomodoro_points': pomodoro_pts_by_month.get(month, 0),
            'points': flashcard_pts_by_month.get(month, 0) + pomodoro_pts_by_month.get(month, 0),
            'tokens': (
                (flashcard_pts_by_month.get(month, 0) + pomodoro_pts_by_month.get(month, 0))
                * focus_by_month.get(month, 0)
            ),
        }
        for month in all_months
    ]

    today = timezone.now().date()
    yesterday = today - timezone.timedelta(days=1)

    daily_rows = (
        PomodoroSession.objects
        .filter(user=user, status=PomodoroSession.Status.ENDED)
        .annotate(day=TruncDate('start_time'))
        .values('day')
        .annotate(total_focus_time=Sum('total_focus_time'))
    )
    focus_by_day = {row['day']: row['total_focus_time'] for row in daily_rows if row['day'] is not None}

    return {
        'months': months,
        'today_focus': focus_by_day.get(today, 0),
        'yesterday_focus': focus_by_day.get(yesterday, 0),
    }
