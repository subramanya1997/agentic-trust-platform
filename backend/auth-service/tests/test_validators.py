"""Unit tests for input validation and sanitization.

This module contains comprehensive tests for input validation and sanitization
utilities. These validators protect against common security vulnerabilities
like XSS, SQL injection, and data corruption.

Test Coverage:
    - String sanitization (HTML removal, null byte removal, whitespace normalization)
    - Email validation (format, length, normalization)
    - Slug validation (format, length, special character rejection)
    - Name validation (sanitization, length, unicode support)
    - URL validation (scheme validation, length, dangerous character rejection)
    - Role validation (allowed values, normalization)
    - XSS prevention (script tags, event handlers, iframes)
    - SQL injection prevention (consecutive hyphens, null bytes)
    - Edge cases (empty strings, max length, unicode, emojis)
    - Pydantic model integration

Security Features:
    - XSS Prevention: Removes HTML tags, script tags, event handlers
    - SQL Injection Prevention: Rejects consecutive hyphens, removes null bytes
    - Input Sanitization: Normalizes whitespace, removes dangerous characters
    - Length Limits: Prevents DoS attacks from extremely long inputs
    - Scheme Validation: Only allows http/https URLs

Validation Rules:
    - Email: RFC 5322 compliant, max 254 chars, lowercase normalized
    - Slug: Lowercase alphanumeric + hyphens, max 100 chars, no consecutive hyphens
    - Name: Sanitized HTML, max 255 chars, preserves unicode
    - URL: http/https only, max 2048 chars, validates format
    - Role: admin, member, viewer only, lowercase normalized
"""

import pytest
from pydantic import BaseModel, ValidationError

from app.core.validators import (
    SanitizedString,
    ValidatedEmail,
    ValidatedName,
    ValidatedRole,
    ValidatedSlug,
    ValidatedUrl,
    sanitize_string,
    validate_email,
    validate_name,
    validate_role,
    validate_slug,
    validate_url,
)


class TestSanitizeString:
    """Tests for sanitize_string function."""

    def test_removes_html_tags(self):
        """Test that HTML tags are removed (XSS prevention)."""
        assert sanitize_string("<script>alert('xss')</script>") == "alert('xss')"
        assert sanitize_string("<b>bold</b> text") == "bold text"
        assert sanitize_string("<img src=x onerror=alert(1)>") == ""

    def test_removes_null_bytes(self):
        """Test that null bytes are removed."""
        assert sanitize_string("hello\x00world") == "helloworld"
        assert sanitize_string("\x00test") == "test"
        assert sanitize_string("test\x00") == "test"

    def test_normalizes_whitespace(self):
        """Test that whitespace is normalized."""
        assert sanitize_string("hello  world") == "hello world"
        assert sanitize_string("hello\t\tworld") == "hello world"
        assert sanitize_string("hello\n\nworld") == "hello world"
        assert sanitize_string("  hello   world  ") == "hello world"

    def test_strips_leading_trailing_whitespace(self):
        """Test that leading/trailing whitespace is removed."""
        assert sanitize_string("  hello  ") == "hello"
        assert sanitize_string("\thello\t") == "hello"
        assert sanitize_string("\nhello\n") == "hello"

    def test_handles_unicode_and_emojis(self):
        """Test that unicode and emojis are preserved."""
        assert sanitize_string("Hello 世界") == "Hello 世界"
        assert sanitize_string("Test 🚀 emoji") == "Test 🚀 emoji"
        assert sanitize_string("Café") == "Café"

    def test_raises_on_non_string(self):
        """Test that non-string input raises TypeError."""
        with pytest.raises(TypeError, match="String required"):
            sanitize_string(123)  # type: ignore
        with pytest.raises(TypeError, match="String required"):
            sanitize_string(None)  # type: ignore


class TestValidateEmail:
    """Tests for validate_email function."""

    def test_valid_emails(self):
        """Test that valid emails pass validation."""
        assert validate_email("test@example.com") == "test@example.com"
        assert validate_email("user.name@example.com") == "user.name@example.com"
        assert validate_email("user+tag@example.co.uk") == "user+tag@example.co.uk"

    def test_normalizes_to_lowercase(self):
        """Test that emails are normalized to lowercase."""
        assert validate_email("Test@Example.COM") == "test@example.com"
        assert validate_email("USER@DOMAIN.COM") == "user@domain.com"

    def test_strips_whitespace(self):
        """Test that whitespace is stripped."""
        assert validate_email("  test@example.com  ") == "test@example.com"

    def test_rejects_invalid_format(self):
        """Test that invalid email formats are rejected."""
        with pytest.raises(ValueError, match="Invalid email format"):
            validate_email("notanemail")
        with pytest.raises(ValueError, match="Invalid email format"):
            validate_email("@example.com")
        with pytest.raises(ValueError, match="Invalid email format"):
            validate_email("user@")
        with pytest.raises(ValueError, match="Invalid email format"):
            validate_email("user @example.com")

    def test_rejects_too_long(self):
        """Test that emails over 254 characters are rejected."""
        long_email = "a" * 250 + "@example.com"  # Total > 254 chars
        with pytest.raises(ValueError, match="Email too long"):
            validate_email(long_email)

    def test_accepts_max_length(self):
        """Test that emails at exactly 254 characters are accepted."""
        # Create email that's exactly 254 characters
        local_part = "a" * 242
        email = f"{local_part}@example.com"  # 242 + 1 + 11 = 254
        assert len(email) == 254
        assert validate_email(email) == email


class TestValidateSlug:
    """Tests for validate_slug function."""

    def test_valid_slugs(self):
        """Test that valid slugs pass validation."""
        assert validate_slug("hello") == "hello"
        assert validate_slug("hello-world") == "hello-world"
        assert validate_slug("test-123") == "test-123"
        assert validate_slug("a") == "a"
        assert validate_slug("1") == "1"

    def test_normalizes_to_lowercase(self):
        """Test that slugs are normalized to lowercase."""
        assert validate_slug("Hello-World") == "hello-world"
        assert validate_slug("TEST") == "test"

    def test_strips_whitespace(self):
        """Test that whitespace is stripped."""
        assert validate_slug("  hello-world  ") == "hello-world"

    def test_rejects_invalid_characters(self):
        """Test that special characters are rejected."""
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("hello_world")  # Underscores not allowed
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("hello world")  # Spaces not allowed
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("hello@world")  # Special chars not allowed
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("hello.world")  # Dots not allowed

    def test_rejects_start_end_with_hyphen(self):
        """Test that slugs starting or ending with hyphen are rejected."""
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("-hello")
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("hello-")
        with pytest.raises(ValueError, match="must contain only lowercase"):
            validate_slug("-")

    def test_rejects_consecutive_hyphens(self):
        """Test that consecutive hyphens are rejected (SQL injection prevention)."""
        with pytest.raises(ValueError, match="cannot contain consecutive hyphens"):
            validate_slug("hello--world")
        with pytest.raises(ValueError, match="cannot contain consecutive hyphens"):
            validate_slug("test---123")

    def test_rejects_too_long(self):
        """Test that slugs over 100 characters are rejected."""
        long_slug = "a" * 101
        with pytest.raises(ValueError, match="must be 100 characters or less"):
            validate_slug(long_slug)

    def test_accepts_max_length(self):
        """Test that slugs at exactly 100 characters are accepted."""
        slug = "a" * 100
        assert validate_slug(slug) == slug


class TestValidateName:
    """Tests for validate_name function."""

    def test_valid_names(self):
        """Test that valid names pass validation."""
        assert validate_name("John Doe") == "John Doe"
        assert validate_name("Acme Inc.") == "Acme Inc."
        assert validate_name("Test Organization 123") == "Test Organization 123"

    def test_sanitizes_input(self):
        """Test that names are sanitized (HTML removed, whitespace normalized)."""
        assert validate_name("<b>Bold Name</b>") == "Bold Name"
        assert validate_name("Name  with   spaces") == "Name with spaces"
        assert validate_name("Name\x00with\x00nulls") == "Namewithnulls"

    def test_rejects_empty_after_sanitization(self):
        """Test that names that are empty after sanitization are rejected."""
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_name("")
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_name("   ")
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_name("<script></script>")

    def test_rejects_too_long(self):
        """Test that names over 255 characters are rejected."""
        long_name = "a" * 256
        with pytest.raises(ValueError, match="must be 255 characters or less"):
            validate_name(long_name)

    def test_accepts_max_length(self):
        """Test that names at exactly 255 characters are accepted."""
        name = "a" * 255
        assert validate_name(name) == name

    def test_handles_unicode(self):
        """Test that unicode characters are preserved."""
        assert validate_name("Café Münster") == "Café Münster"
        assert validate_name("北京市") == "北京市"
        assert validate_name("Company™") == "Company™"


class TestValidateUrl:
    """Tests for validate_url function."""

    def test_valid_urls(self):
        """Test that valid URLs pass validation."""
        assert validate_url("https://example.com") == "https://example.com"
        assert validate_url("http://example.com") == "http://example.com"
        assert validate_url("https://example.com/path") == "https://example.com/path"
        assert validate_url("https://example.com/path?query=1") == "https://example.com/path?query=1"

    def test_allows_none(self):
        """Test that None is allowed."""
        assert validate_url(None) is None

    def test_strips_whitespace(self):
        """Test that whitespace is stripped."""
        assert validate_url("  https://example.com  ") == "https://example.com"

    def test_rejects_invalid_scheme(self):
        """Test that non-http(s) schemes are rejected."""
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("ftp://example.com")
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("javascript:alert(1)")
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("data:text/html,<script>alert(1)</script>")

    def test_rejects_special_characters(self):
        """Test that dangerous special characters are rejected."""
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("https://example.com/<script>")
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url('https://example.com/"quoted"')
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("https://example.com/{bracket}")

    def test_rejects_missing_scheme(self):
        """Test that URLs without scheme are rejected."""
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("example.com")
        with pytest.raises(ValueError, match="Invalid URL format"):
            validate_url("www.example.com")

    def test_rejects_too_long(self):
        """Test that URLs over 2048 characters are rejected."""
        long_url = "https://example.com/" + "a" * 2030  # Total > 2048
        with pytest.raises(ValueError, match="URL too long"):
            validate_url(long_url)

    def test_accepts_max_length(self):
        """Test that URLs at exactly 2048 characters are accepted."""
        # "https://example.com/" is 20 chars, so 2048 - 20 = 2028 chars for path
        path = "a" * 2028
        url = f"https://example.com/{path}"
        assert len(url) == 2048
        assert validate_url(url) == url


class TestValidateRole:
    """Tests for validate_role function."""

    def test_valid_roles(self):
        """Test that valid roles pass validation."""
        assert validate_role("admin") == "admin"
        assert validate_role("member") == "member"
        assert validate_role("viewer") == "viewer"

    def test_normalizes_to_lowercase(self):
        """Test that roles are normalized to lowercase."""
        assert validate_role("Admin") == "admin"
        assert validate_role("MEMBER") == "member"
        assert validate_role("Viewer") == "viewer"

    def test_strips_whitespace(self):
        """Test that whitespace is stripped."""
        assert validate_role("  admin  ") == "admin"
        assert validate_role("\tmember\t") == "member"

    def test_rejects_invalid_roles(self):
        """Test that invalid roles are rejected."""
        with pytest.raises(ValueError, match="Invalid role"):
            validate_role("owner")
        with pytest.raises(ValueError, match="Invalid role"):
            validate_role("superadmin")
        with pytest.raises(ValueError, match="Invalid role"):
            validate_role("guest")
        with pytest.raises(ValueError, match="Invalid role"):
            validate_role("custom-role")


class TestAnnotatedTypesInPydanticModels:
    """Tests for annotated types used in Pydantic models."""

    def test_validated_name_in_model(self):
        """Test ValidatedName in a Pydantic model."""
        
        class TestModel(BaseModel):
            name: ValidatedName

        # Valid name
        model = TestModel(name="Test Name")
        assert model.name == "Test Name"

        # Sanitizes HTML
        model = TestModel(name="<b>Bold</b> Name")
        assert model.name == "Bold Name"

        # Rejects empty
        with pytest.raises(ValidationError):
            TestModel(name="")

        # Rejects too long
        with pytest.raises(ValidationError):
            TestModel(name="a" * 256)

    def test_validated_email_in_model(self):
        """Test ValidatedEmail in a Pydantic model."""
        
        class TestModel(BaseModel):
            email: ValidatedEmail

        # Valid email
        model = TestModel(email="test@example.com")
        assert model.email == "test@example.com"

        # Normalizes to lowercase
        model = TestModel(email="Test@Example.COM")
        assert model.email == "test@example.com"

        # Rejects invalid format
        with pytest.raises(ValidationError):
            TestModel(email="notanemail")

    def test_validated_slug_in_model(self):
        """Test ValidatedSlug in a Pydantic model."""
        
        class TestModel(BaseModel):
            slug: ValidatedSlug

        # Valid slug
        model = TestModel(slug="test-slug")
        assert model.slug == "test-slug"

        # Normalizes to lowercase
        model = TestModel(slug="Test-Slug")
        assert model.slug == "test-slug"

        # Rejects consecutive hyphens
        with pytest.raises(ValidationError):
            TestModel(slug="test--slug")

        # Rejects special characters
        with pytest.raises(ValidationError):
            TestModel(slug="test_slug")

    def test_validated_url_in_model(self):
        """Test ValidatedUrl in a Pydantic model."""
        
        class TestModel(BaseModel):
            url: ValidatedUrl

        # Valid URL
        model = TestModel(url="https://example.com")
        assert model.url == "https://example.com"

        # Allows None
        model = TestModel(url=None)
        assert model.url is None

        # Rejects invalid scheme
        with pytest.raises(ValidationError):
            TestModel(url="ftp://example.com")

    def test_validated_role_in_model(self):
        """Test ValidatedRole in a Pydantic model."""
        
        class TestModel(BaseModel):
            role: ValidatedRole

        # Valid role
        model = TestModel(role="admin")
        assert model.role == "admin"

        # Normalizes to lowercase
        model = TestModel(role="Admin")
        assert model.role == "admin"

        # Rejects invalid role
        with pytest.raises(ValidationError):
            TestModel(role="superadmin")

    def test_sanitized_string_in_model(self):
        """Test SanitizedString in a Pydantic model."""
        
        class TestModel(BaseModel):
            text: SanitizedString

        # Sanitizes HTML
        model = TestModel(text="<script>alert('xss')</script>Hello")
        assert model.text == "alert('xss')Hello"

        # Removes null bytes
        model = TestModel(text="Hello\x00World")
        assert model.text == "HelloWorld"

        # Normalizes whitespace
        model = TestModel(text="Hello   World")
        assert model.text == "Hello World"


class TestXSSPrevention:
    """Tests for XSS attack prevention."""

    def test_script_tags_removed(self):
        """Test that script tags are completely removed."""
        dangerous_inputs = [
            "<script>alert('xss')</script>",
            "<script src='http://evil.com/xss.js'></script>",
            "<SCRIPT>alert('xss')</SCRIPT>",
            "<<SCRIPT>alert('xss');//<</SCRIPT>",
        ]
        for input_str in dangerous_inputs:
            result = sanitize_string(input_str)
            assert "<script" not in result.lower()
            assert "script>" not in result.lower()

    def test_event_handlers_removed(self):
        """Test that HTML event handlers are removed."""
        dangerous_inputs = [
            "<img src=x onerror=alert(1)>",
            "<body onload=alert(1)>",
            "<div onclick='alert(1)'>",
        ]
        for input_str in dangerous_inputs:
            result = sanitize_string(input_str)
            assert "onerror" not in result.lower()
            assert "onload" not in result.lower()
            assert "onclick" not in result.lower()

    def test_iframe_tags_removed(self):
        """Test that iframe tags are removed."""
        result = sanitize_string("<iframe src='http://evil.com'></iframe>")
        assert "<iframe" not in result.lower()
        assert "iframe>" not in result.lower()


class TestSQLInjectionPrevention:
    """Tests for SQL injection prevention."""

    def test_consecutive_hyphens_rejected_in_slug(self):
        """Test that consecutive hyphens (SQL comment syntax) are rejected in slugs."""
        with pytest.raises(ValueError, match="cannot contain consecutive hyphens"):
            validate_slug("test--slug")

    def test_null_bytes_removed(self):
        """Test that null bytes (string termination bypass) are removed."""
        result = sanitize_string("admin'\x00-- ")
        assert "\x00" not in result
        # Note: trailing whitespace is also stripped by sanitize_string
        assert result == "admin'--"


class TestEdgeCases:
    """Tests for edge cases and boundary conditions."""

    def test_empty_strings(self):
        """Test handling of empty strings."""
        assert sanitize_string("") == ""
        assert sanitize_string("   ") == ""
        
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_name("")
        
        with pytest.raises(ValueError, match="cannot be empty"):
            validate_name("   ")

    def test_very_long_strings(self):
        """Test handling of very long strings."""
        # Name max length
        with pytest.raises(ValueError, match="must be 255 characters or less"):
            validate_name("a" * 256)
        
        # Slug max length
        with pytest.raises(ValueError, match="must be 100 characters or less"):
            validate_slug("a" * 101)
        
        # Email max length
        with pytest.raises(ValueError, match="Email too long"):
            validate_email("a" * 250 + "@example.com")
        
        # URL max length
        with pytest.raises(ValueError, match="URL too long"):
            validate_url("https://example.com/" + "a" * 2030)

    def test_unicode_characters(self):
        """Test handling of unicode characters."""
        # Unicode should be preserved in names
        assert validate_name("Café") == "Café"
        assert validate_name("北京市") == "北京市"
        assert validate_name("Москва") == "Москва"

    def test_emoji_characters(self):
        """Test handling of emoji characters."""
        # Emojis should be preserved in names
        assert validate_name("Company 🚀") == "Company 🚀"
        assert validate_name("Test ✅ Name") == "Test ✅ Name"

    def test_mixed_content(self):
        """Test handling of mixed valid and invalid content."""
        # HTML mixed with valid text (whitespace between tags and content is normalized)
        assert sanitize_string("Hello <b>world</b>!") == "Hello world!"
        
        # Multiple issues at once
        result = sanitize_string("<script>alert(1)</script>  Hello\x00World  ")
        assert result == "alert(1) HelloWorld"

