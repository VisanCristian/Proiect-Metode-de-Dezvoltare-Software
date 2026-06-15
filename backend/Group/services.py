from . import models
from django.utils.crypto import get_random_string

def group_create(*, name: str, owner_id: int) -> models.Group:
    token = get_random_string(length=12)
    group = models.Group(name=name, token=token, owner=owner_id)
    group.save()

    # Automatically add the owner to the group
    user_group = models.UserGroup(group=group, user_id=owner_id)
    user_group.save()
    
    return group

def group_join(*, token: str, user_id: int) -> models.Group:
    group = models.Group.objects.get(token=token)
    
    # Check if user is already in the group
    if not models.UserGroup.objects.filter(group=group, user_id=user_id).exists():
        user_group = models.UserGroup(group=group, user_id=user_id)
        user_group.save()
        
    return group

def group_leave(*, group_id: int, user_id: int) -> None:
    group = models.Group.objects.get(pk=group_id)
    
    if group.owner == user_id:
        # If the owner leaves, the group is deleted. 
        # This will cascade and delete all UserGroup associations for this group.
        group.delete()
    else:
        # Otherwise, just remove the user from the group
        models.UserGroup.objects.filter(group=group, user_id=user_id).delete()
