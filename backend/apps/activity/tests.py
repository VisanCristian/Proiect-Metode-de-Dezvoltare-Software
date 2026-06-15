from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.pomodoro.models import PomodoroSession
from FlashCards.models import Deck, DeckSession


class UserActivityReportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='geo', password='pass')
        self.token = Token.objects.create(user=self.user)

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_unauthenticated_returns_401(self):
        response = self.client.get('/api/activity/')
        self.assertEqual(response.status_code, 401)

    def test_authenticated_empty_returns_empty_list(self):
        self._auth()
        response = self.client.get('/api/activity/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_authenticated_returns_monthly_report(self):
        self._auth()

        PomodoroSession.objects.create(
            user=self.user,
            status=PomodoroSession.Status.ENDED,
            start_time='2026-03-10T10:00:00Z',
            end_time='2026-03-10T10:25:00Z',
            total_focus_time=1500,
        )

        deck = Deck.objects.create(user=self.user, title='Test Deck')
        ds = DeckSession.objects.create(user=self.user, deck=deck, responses=20, mistakes=3)
        DeckSession.objects.filter(pk=ds.pk).update(date=date(2026, 3, 15))

        response = self.client.get('/api/activity/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['month'], '2026-03')
        self.assertEqual(data[0]['total_focus_time'], 1500)
        self.assertEqual(data[0]['total_solved_cards'], 20)

    def test_report_aggregates_multiple_months(self):
        self._auth()

        PomodoroSession.objects.create(
            user=self.user,
            status=PomodoroSession.Status.ENDED,
            start_time='2026-02-05T09:00:00Z',
            end_time='2026-02-05T09:25:00Z',
            total_focus_time=900,
        )
        PomodoroSession.objects.create(
            user=self.user,
            status=PomodoroSession.Status.ENDED,
            start_time='2026-03-10T10:00:00Z',
            end_time='2026-03-10T10:25:00Z',
            total_focus_time=1500,
        )

        deck = Deck.objects.create(user=self.user, title='Test Deck')
        ds1 = DeckSession.objects.create(user=self.user, deck=deck, responses=10, mistakes=1)
        ds2 = DeckSession.objects.create(user=self.user, deck=deck, responses=20, mistakes=2)
        DeckSession.objects.filter(pk=ds1.pk).update(date=date(2026, 2, 10))
        DeckSession.objects.filter(pk=ds2.pk).update(date=date(2026, 3, 15))

        response = self.client.get('/api/activity/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['month'], '2026-02')
        self.assertEqual(data[0]['total_focus_time'], 900)
        self.assertEqual(data[0]['total_solved_cards'], 10)
        self.assertEqual(data[1]['month'], '2026-03')
        self.assertEqual(data[1]['total_focus_time'], 1500)
        self.assertEqual(data[1]['total_solved_cards'], 20)

    def test_report_excludes_other_users_data(self):
        self._auth()

        other = User.objects.create_user(username='other', password='pass')
        other_deck = Deck.objects.create(user=other, title='Other Deck')
        ds = DeckSession.objects.create(user=other, deck=other_deck, responses=50, mistakes=0)
        DeckSession.objects.filter(pk=ds.pk).update(date=date(2026, 3, 1))

        response = self.client.get('/api/activity/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_draft_pomodoro_sessions_not_counted(self):
        self._auth()

        PomodoroSession.objects.create(
            user=self.user,
            status=PomodoroSession.Status.DRAFT,
            total_focus_time=999,
        )

        response = self.client.get('/api/activity/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
