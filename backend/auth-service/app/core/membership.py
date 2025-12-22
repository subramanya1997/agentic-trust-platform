"""Organization membership utilities.

This module provides utilities for verifying organization membership.
It uses WorkOS API to check if a user is a member of an organization,
which is essential for authorization checks.

Key Features:
- WorkOS-based membership verification
- Fast authorization checks
- Consistent error handling

Usage:
    from app.core.membership import verify_org_membership
    
    # Verify user is member of organization
    verify_org_membership(user_id="user_123", organization_id="org_456")
    # Raises HTTPException 403 if not a member
"""

from fastapi import HTTPException, status

from app.core import workos_client


def verify_org_membership(user_id: str, organization_id: str) -> None:
    """
    Verify that a user is a member of an organization.
    
    This function checks if a user has membership in a specific organization
    by querying WorkOS. It's used for authorization checks before allowing
    access to organization-scoped resources.
    
    Args:
        user_id: The user's WorkOS ID (format: user_xxxxx)
        organization_id: The organization's WorkOS ID (format: org_xxxxx)
        
    Raises:
        HTTPException: 403 Forbidden if user is not a member of the organization
        
    Example:
        >>> verify_org_membership("user_01ABC123", "org_01XYZ789")
        # Returns None if user is a member
        
        >>> verify_org_membership("user_01ABC123", "org_01BAD456")
        # Raises HTTPException(status_code=403, detail="Not a member of this organization")
        
    Usage in Route Handlers:
        @router.get("/organizations/{org_id}")
        async def get_organization(org_id: str, session: SessionData = Depends(get_session)):
            # Verify user is member before accessing org data
            verify_org_membership(session.user.id, org_id)
            # ... rest of handler
    """
    memberships = workos_client.list_organization_memberships(
        user_id=user_id,
        organization_id=organization_id,
    )
    
    if not memberships.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

