import os
import django


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StudyAPP.settings')
    django.setup()

    from Agents.models import FlashcardPointLog

    print("Total logs:", FlashcardPointLog.objects.count())
    for log in FlashcardPointLog.objects.all():
        print(log.user.username, log.points, log.earned_at, log.flashcard_id)


if __name__ == '__main__':
    main()
