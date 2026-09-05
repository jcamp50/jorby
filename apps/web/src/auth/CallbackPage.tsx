export function CallbackPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-3 px-4">
      <h1 className="text-2xl font-medium tracking-tight">Signing in</h1>
      <p className="text-sm text-muted-foreground">
        This route is reserved for the public OAuth PKCE callback. Do not embed a client secret.
      </p>
    </main>
  )
}
