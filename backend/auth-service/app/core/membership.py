"""Organization membership utilities."""

from fastapi import HTTPException, status

from app.core import workos_client


def verify_org_membership(user_id: str, organization_id: str) -> None:
    """
    Verify that a user is a member of an organization.
    
    Args:
        user_id: The user's WorkOS ID
        organization_id: The organization's WorkOS ID
        
    Raises:
        HTTPException: 403 if user is not a member of the organization
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

