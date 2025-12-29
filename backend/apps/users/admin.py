"""User admin."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Organization, UserProfile, SubscriptionHistory


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'subscription_plan', 'is_subscription_active', 'is_active', 'created_at']
    list_filter = ['subscription_plan', 'is_active', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'slug', 'description', 'logo', 'is_active')
        }),
        ('Suscripción', {
            'fields': ('subscription_plan', 'subscription_start_date', 'subscription_end_date',
                      'max_users', 'max_projects', 'max_storage_gb')
        }),
    )


@admin.register(SubscriptionHistory)
class SubscriptionHistoryAdmin(admin.ModelAdmin):
    list_display = ['organization', 'plan', 'status', 'start_date', 'end_date', 'amount']
    list_filter = ['plan', 'status', 'created_at']
    search_fields = ['organization__name', 'transaction_id']


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'organization', 'is_active']
    list_filter = ['role', 'is_active', 'organization', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    inlines = [UserProfileInline]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'position', 'avatar')}),
        ('Organization', {'fields': ('organization', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    readonly_fields = ['created_at', 'updated_at', 'last_login']

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'role', 'organization'),
        }),
    )
