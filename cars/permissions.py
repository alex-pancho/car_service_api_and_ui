from rest_framework.permissions import SAFE_METHODS, BasePermission


class ReadOnlyOrAuthenticated(BasePermission):
    """
    GET, HEAD, OPTIONS — доступні всім
    POST, PUT, PATCH, DELETE — тільки авторизованим
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
