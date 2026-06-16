import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StudyAPP.settings')
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from Agents.models import AgentMemory  # noqa: E402
from apps.activity.selectors import get_monthly_activity  # noqa: E402

User = get_user_model()
user = User.objects.first()

memory, _ = AgentMemory.objects.get_or_create(user=user)
activity = get_monthly_activity(user)
earned_tokens = sum(month.get('tokens', 0) for month in activity.get('months', []))
available_tokens = 2500 + earned_tokens - memory.consumed_tokens

print(f"Earned: {earned_tokens}")
print(f"Consumed: {memory.consumed_tokens}")
print(f"Available: {available_tokens}")
