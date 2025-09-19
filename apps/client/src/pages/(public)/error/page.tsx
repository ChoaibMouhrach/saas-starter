import { errorRoute } from "@/routes/main";

export const ErrorPage = () => {
  const { error } = errorRoute.useSearch();

  return (
    <main className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold">An error occured!!</h1>
        <span className="text-muted-foreground mt-1">{error}</span>
      </div>
    </main>
  );
};
