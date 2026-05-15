const admin = require("firebase-admin");

let initialized = false;

const initializeFirebase = () => {
	if (admin.apps.length > 0) {
		initialized = true;
		return;
	}

	try {
		if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
			const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			});
			initialized = true;
			console.log("Firebase initialized with FIREBASE_SERVICE_ACCOUNT_JSON");
			return;
		}

		if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
			admin.initializeApp({
				credential: admin.credential.applicationDefault(),
			});
			initialized = true;
			console.log("Firebase initialized with GOOGLE_APPLICATION_CREDENTIALS");
			return;
		}

		console.warn("Firebase not initialized: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS");
	} catch (error) {
		console.error("Failed to initialize Firebase:", error.message);
	}
};

initializeFirebase();

module.exports = {
	admin,
	isFirebaseInitialized: () => initialized,
};
