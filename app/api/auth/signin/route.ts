import { auth } from '@/lib/auth'

export async function POST(req: Request) {
	const body = await req.json()
	return auth.api.signInSocial({
		body: {
			provider: body.provider,
			callbackURL: body.callbackUrl,
		},
		asResponse: true,
	})
}
