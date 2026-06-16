from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_monthly_activity


class UserActivityReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_monthly_activity(user=request.user)
        return Response(data)
