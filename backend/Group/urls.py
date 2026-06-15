from django.urls import path
from . import views

urlpatterns = [
    path('create', views.GroupCreateApi.as_view(), name='create-group'),
    path('list', views.GroupListApi.as_view(), name='list-groups'),
    path('join', views.GroupJoinApi.as_view(), name='join-group'),
    path('leave', views.GroupLeaveApi.as_view(), name='leave-group'),
    path('detail/<int:group_id>', views.GroupDetailApi.as_view(), name='detail-group'),
    path('<int:group_id>/share_deck', views.GroupShareDeckApi.as_view(), name='share-deck'),
    path('<int:group_id>/share_file', views.GroupShareFileApi.as_view(), name='share-file'),
    path('<int:group_id>/unshare_deck', views.GroupUnshareDeckApi.as_view(), name='unshare-deck'),
    path('<int:group_id>/unshare_file', views.GroupUnshareFileApi.as_view(), name='unshare-file'),
]
