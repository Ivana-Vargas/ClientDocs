export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>clientdocs</h1>
        <p>secure access for admin and manager</p>
        <form>
          <label htmlFor="email">email</label>
          <input id="email" type="email" name="email" autoComplete="email" />

          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
          />

          <button type="submit">sign in</button>
        </form>
      </section>
    </main>
  )
}
