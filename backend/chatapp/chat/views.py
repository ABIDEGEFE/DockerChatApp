from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Message, Group, Profile
from .serializers import MessageSerializer, UserSerializer, GroupSerializer, ProfileSerializer

User = get_user_model()

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('-id')
    serializer_class = GroupSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(name__icontains=q)
        return qs

    def perform_create(self, serializer):
        group = serializer.save()
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            group.members.add(user)

class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MessageSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        qs = Message.objects.all().order_by('timestamp')
        if group_id:
            qs = qs.filter(group_id=group_id)
        return qs

class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        bio = request.data.get('bio')
        if not username or not password:
            return Response({'detail': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'username taken'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        Profile.objects.create(user=user, bio=bio)
        return Response({'id': user.id, 'username': user.username, 'email': user.email, 'bio': bio})

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response({'detail': 'ok', 'user': {'id': user.id, 'username': user.username}})

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        logout(request)
        return Response({'detail': 'ok'})

class GroupMembersView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def get(self, request, pk):
        try:
            group = Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)
        data = UserSerializer(group.members.all(), many=True).data
        return Response({'members': data})

@method_decorator(csrf_exempt, name='dispatch')
class JoinGroupView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    def post(self, request, pk):
        username = request.data.get('username')
        try:
            group = Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)
        user = None
        if request.user and request.user.is_authenticated:
            user = request.user
        elif username:
            user, created = User.objects.get_or_create(username=username)
            if created:
                Profile.objects.create(user=user)
        if not user:
            return Response({'detail': 'user required'}, status=status.HTTP_400_BAD_REQUEST)
        group.members.add(user)
        return Response({'detail': 'joined', 'user': UserSerializer(user).data})
