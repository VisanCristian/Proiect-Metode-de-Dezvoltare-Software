from django.urls import path
from . import views

urlpatterns = [
    path('create', views.GroupCreateApi.as_view(), name='create-group'),
    path('list', views.GroupListApi.as_view(), name='list-groups'),
    path('join', views.GroupJoinApi.as_view(), name='join-group'),
    path('leave', views.GroupLeaveApi.as_view(), name='leave-group'),
]
