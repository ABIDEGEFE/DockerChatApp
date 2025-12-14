from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, MessageViewSet, ProfileViewSet, RegisterView, LoginView, LogoutView, GroupMembersView, JoinGroupView

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
	path('', include(router.urls)),
	path('register/', RegisterView.as_view(), name='register'),
	path('login/', LoginView.as_view(), name='login'),
	path('logout/', LogoutView.as_view(), name='logout'),
	path('groups/<int:pk>/members/', GroupMembersView.as_view(), name='group-members'),
	path('groups/<int:pk>/join/', JoinGroupView.as_view(), name='group-join'),
]
