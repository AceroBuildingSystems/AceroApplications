import "server-only";

export const metadata = {
  title: 'Reset Your Password | Acero Applications',
  description: 'Create a new password for your Acero account',
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
