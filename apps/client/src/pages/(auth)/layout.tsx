interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen min-w-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
};
