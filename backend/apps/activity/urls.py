from django.urls import path

from .views import UserActivityReportView

urlpatterns = [
    path('', UserActivityReportView.as_view(), name='activity-report'),
]
