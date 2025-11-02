from django.urls import path
from .views import CurrentUserView, ProfileView

urlpatterns = [
    path("current/", CurrentUserView.as_view(), name="users-current"),
    path("profile/", ProfileView.as_view(), name="users-profile"),
]
