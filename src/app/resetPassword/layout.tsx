import "server-only";

export const metadata = {
  title: 'Reset Password | Acero Applications',
  description: 'Reset your password for Acero Applications',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
