interface SecurityEventDetails {
	[key: string]: string | number | boolean | null | undefined;
}

export function logSecurityEvent(event: string, details: SecurityEventDetails = {}): void {
	console.log(
		JSON.stringify({
			type: "security_event",
			event,
			timestamp: new Date().toISOString(),
			...details,
		}),
	);
}
