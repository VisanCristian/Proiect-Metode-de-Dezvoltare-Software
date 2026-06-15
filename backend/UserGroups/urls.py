from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserGroupViewSet

# generate automatically all the necessary rotues for the UserGroupViewSet 9CRUD + actions)
router = DefaultRouter()
router.register('', UserGroupViewSet, basename='group')

urlpatterns = [
    path('', include(router.urls)),
]
