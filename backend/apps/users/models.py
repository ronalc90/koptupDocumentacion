"""User models."""
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class Organization(models.Model):
    """Organization/Company model."""

    PLAN_CHOICES = [
        ('FREE', 'Plan Gratuito'),
        ('BASIC', 'Plan Básico'),
        ('PROFESSIONAL', 'Plan Profesional'),
        ('ENTERPRISE', 'Plan Enterprise'),
    ]

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='organizations/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    # Subscription fields
    subscription_plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='FREE')
    subscription_start_date = models.DateTimeField(null=True, blank=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    max_users = models.IntegerField(default=5)
    max_projects = models.IntegerField(default=3)
    max_storage_gb = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def is_subscription_active(self):
        """Check if subscription is active."""
        if not self.subscription_end_date:
            return False
        from django.utils import timezone
        return timezone.now() < self.subscription_end_date


class User(AbstractUser):
    """Custom user model."""

    ROLE_CHOICES = [
        ('ADMIN', 'Administrador de Plataforma'),
        ('PO', 'Product Owner'),
        ('DEV', 'Desarrollador'),
        ('QA', 'QA/Tester'),
        ('CLIENT', 'Cliente/Stakeholder'),
    ]

    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='DEV')
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    position = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_role_display_name(self):
        """Get the display name for the user's role."""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)


class UserProfile(models.Model):
    """Extended user profile information."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='es')
    notifications_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"Profile of {self.user.email}"


class SubscriptionHistory(models.Model):
    """Subscription history and billing."""

    STATUS_CHOICES = [
        ('ACTIVE', 'Activa'),
        ('EXPIRED', 'Expirada'),
        ('CANCELLED', 'Cancelada'),
        ('SUSPENDED', 'Suspendida'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='subscription_history'
    )
    plan = models.CharField(max_length=20, choices=Organization.PLAN_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subscription_history'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.organization.name} - {self.plan} ({self.status})"
