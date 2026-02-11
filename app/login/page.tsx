export default function LoginPage() {
	return (
		<div style={{ padding: 40 }}>
			<h1>Login</h1>
			<a href='/api/auth/login?provider=google'>Continue with Google</a>
			<br />
			<br />
			<a href='/api/auth/login?provider=github'>Continue with GitHub</a>
		</div>
	)
}
