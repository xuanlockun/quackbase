import { SignJWT, jwtVerify } from "jose";
import { getOrCreateJwtSigningKey } from "./runtime-secret";

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "edge-cms-admin";

function getSecretKey(secret: string): Uint8Array {
	const normalizedSecret = secret.trim();
	return new TextEncoder().encode(normalizedSecret);
}

export async function signAdminJwt(userId: number, email: string, db: D1Database): Promise<string> {
	const secret = await getOrCreateJwtSigningKey(db);
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
	db: D1Database,
): Promise<{ userId: number; email: string } | null> {
	try {
		const secret = await getOrCreateJwtSigningKey(db);
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
