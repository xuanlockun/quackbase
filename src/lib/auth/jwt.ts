import { SignJWT, jwtVerify } from "jose";

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "edge-cms-admin";

function getSecretKey(secret: string): Uint8Array {
	return new TextEncoder().encode(secret);
}

export async function signAdminJwt(userId: number, email: string, secret: string): Promise<string> {
	return new SignJWT({ email })
		.setProtectedHeader({ alg: JWT_ALGORITHM })
		.setSubject(String(userId))
		.setIssuer(JWT_ISSUER)
		.setAudience("admin")
		.setIssuedAt()
		.setExpirationTime("8h")
		.sign(getSecretKey(secret));
}

export async function verifyAdminJwt(
	token: string,
	secret: string,
): Promise<{ userId: number; email: string } | null> {
	try {
		const { payload } = await jwtVerify(token, getSecretKey(secret), {
			issuer: JWT_ISSUER,
			audience: "admin",
		});

		const userId = Number(payload.sub);
		if (!Number.isInteger(userId) || typeof payload.email !== "string") {
			return null;
		}

		return {
			userId,
			email: payload.email,
		};
	} catch {
		return null;
	}
}
