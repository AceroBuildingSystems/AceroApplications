# Password Reset Functionality

This documentation outlines how to test and use the password reset functionality.

## Overview

The password reset flow consists of:

1. User requests a password reset by providing their email
2. System generates a reset token and sends an email with a reset link
3. User clicks the link and is taken to a page to enter a new password
4. System verifies the token and updates the user's password

## Testing the Flow

### Testing with the Test API

For developers, we've created a special test endpoint to verify the flow:

1. Start the development server:
   ```
   npm run dev
   ```

2. Access the test endpoint to create a test user and generate a valid reset token:
   ```
   GET http://localhost:3000/api/test-reset
   ```

3. The response will include:
   - Test email: `test-reset@example.com`
   - Reset token
   - Reset URL (which you can click or copy/paste into your browser)
   - Token expiry time

4. Visit the reset URL to test the reset password UI flow
5. Enter a new password
6. The system will update the password and redirect to the login page

### Testing with a Real User

To test with a real user account:

1. Start the development server:
   ```
   npm run dev
   ```

2. Visit the forgot password page:
   ```
   http://localhost:3000/resetPassword
   ```

3. Enter an existing user's email address
4. Check the console for logs or email service for the reset link
5. Visit the reset link
6. Enter a new password
7. Try logging in with the new password

## Testing Email Functionality

To verify the email sending works:

```
GET http://localhost:3000/api/test-email?email=your-email@example.com
```

Make sure to include the `email=` parameter as shown above. For example:

```
http://localhost:3000/api/test-email?email=ibrahim.abdulla@acero.ae
```

## Implementation Notes

The password reset functionality has been implemented with the following components:

1. User model extended with `resetToken` and `resetTokenExpiry` fields
2. Reset request API endpoint at `/api/reset-password`
3. Token validation and password update endpoint at `/api/reset-password-confirm`
4. Reset password request UI at `/resetPassword`
5. New password entry UI at `/reset-password/[token]`

## Troubleshooting

If you encounter issues:

1. Check server logs for error messages
2. Verify the reset token hasn't expired (tokens are valid for 1 hour)
3. Make sure the email service is properly configured
4. Confirm that database connections are working correctly

### Common Issues

If you encounter a "user not found" error when resetting your password:
1. Check if your email address is registered in the system
2. Request a new password reset link
3. Ensure you're clicking the link from the most recent reset email
4. Check that the reset link hasn't expired (valid for 1 hour only)

If you need technical support, please contact the system administrator.
