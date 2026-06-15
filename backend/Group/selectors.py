from django.shortcuts import get_object_or_404
from .models import Group, UserGroup

def get_user_groups(*, user_id: int):
    # Returns a list of groups the user belongs to
    user_groups = UserGroup.objects.filter(user_id=user_id)
    group_ids = [ug.group_id for ug in user_groups]
    return Group.objects.filter(id__in=group_ids)

def get_group_by_token(*, token: str) -> Group:
    return get_object_or_404(Group, token=token)

def get_group_by_id(*, group_id: int) -> Group:
    return get_object_or_404(Group, id=group_id)
