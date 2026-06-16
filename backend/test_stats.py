import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StudyAPP.settings')
django.setup()

from apps.activity.selectors import get_monthly_activity  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402

User = get_user_model()
user = User.objects.first()
print(get_monthly_activity(user))
