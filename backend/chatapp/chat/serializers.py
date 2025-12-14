from rest_framework import serializers
from .models import Message, CustomUser, Group, Profile

class UserSerializer(serializers.ModelSerializer):
    bio = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'avatar']

    def get_bio(self, obj):
        try:
            return obj.profile.bio
        except Exception:
            return None

    def get_avatar(self, obj):
        try:
            avatar = obj.profile.avatar
            return avatar.url if avatar else None
        except Exception:
            return None

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['user', 'bio', 'avatar']

class GroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'members']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'group', 'content', 'timestamp']
