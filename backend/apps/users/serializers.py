"""User serializers."""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organization, UserProfile


class OrganizationSerializer(serializers.ModelSerializer):
    """Organization serializer."""

    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'description', 'logo', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer."""

    class Meta:
        model = UserProfile
        fields = ['bio', 'timezone', 'language', 'notifications_enabled', 'email_notifications']


class UserSerializer(serializers.ModelSerializer):
    """User serializer."""

    organization_name = serializers.CharField(source='organization.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'role_display',
            'organization', 'organization_name', 'avatar', 'phone', 'position',
            'is_active', 'created_at', 'updated_at', 'profile'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """User creation serializer."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'first_name', 'last_name',
            'role', 'organization', 'phone', 'position'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')

        # Si el usuario no tiene organización, crear una organización personal
        if not validated_data.get('organization'):
            from django.utils.text import slugify
            org_name_base = f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()
            if not org_name_base:
                org_name_base = validated_data.get('email', 'usuario').split('@')[0]

            # Crear nombre único
            org_name = f"Organización de {org_name_base}"
            name_counter = 1
            unique_name = org_name
            while Organization.objects.filter(name=unique_name).exists():
                unique_name = f"{org_name} {name_counter}"
                name_counter += 1

            # Crear slug único
            base_slug = slugify(org_name_base)
            slug = base_slug
            slug_counter = 1
            while Organization.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{slug_counter}"
                slug_counter += 1

            # Crear organización personal
            personal_org = Organization.objects.create(
                name=unique_name,
                slug=slug,
                description=f"Organización personal de {validated_data.get('email', 'usuario')}",
                subscription_plan='FREE',
                max_users=1,
                max_projects=3,
                max_storage_gb=1
            )
            validated_data['organization'] = personal_org

        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """User update serializer."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'position', 'avatar']


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Las contraseñas no coinciden."})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['organization'] = user.organization.id if user.organization else None

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user data to response
        data['user'] = UserSerializer(self.user).data

        return data
