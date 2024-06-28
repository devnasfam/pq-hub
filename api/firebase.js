import admin from 'firebase-admin';

const serviceAccount ={
  "type": "service_account",
  "project_id": "nasfam-gas-pay",
  "private_key_id": "6323c7a0074c94880f6575e3217f3638e5a1352e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKpjkpRTaUtizy\npJLT7DDl4/6TmLzXs8gZaI56NTw5I0XVhPTWPYJHqDbmBBhNZDIDwKA+xUdeLsdf\n0N9xE57Cj5Ju8olA4egmejH7URXJckZ0ZRQtRtpa3SJRbZxlUPlYMpL/gq294R7a\npZP66vNxJkw0p3LuDW5MFmtn88/wrvscSN9NUD40SpPLoKkMh7sUW3k83j+Oy7+M\n4uFIuZtlq69FyfGFV0eZTZXNpwGmyk1t3Qbtt6/g+7Y4b+GtTb8IBhQURjuc8xUv\nWXZo/PhKpWjKkvOznPqYgljlhKvBEwjOFqFTDD6QJ7/JJV1jfiHx5A5mmInIQZL9\nYOH1TqKhAgMBAAECggEAAjCVtXhZ44e1tkXx6zpmHd5oBBWkHZ2WHH0IpD9ahLUd\nVS0UqO5tJpO4AiXu0pSyDmAcKy4L6fy7od8/MAIDBI/8Y8ZP8btvMvJicRhjdlhp\nGSH1e+R7AKGSBosESIRrO6Jbacl7iKSgbzCgo1co935KoQSZxXCLW3dW+2xDJcnk\nLIVddl4FU6NRtjJB160blSzI+wliHhlCTj+qVsjiVZVtIw0EHDW8QnmIHoHaQ+kp\nmMOHXdaqKfwfDTMuWSeeypD8q2IWohVMVUZMD3XMULSu9o6ZSFcTi/inVNauao5r\n3IgpjIlIfO+6D9l6fy/OjlOZY52GoPmXIAX4oe/+ZQKBgQD8RB8py5ry7qoJBr6B\n1924Ek9yf58Zt6PkmVjpOeKEomWGyX6eUJw6McaIa2gD7VUwP9cXMER/F5uVn9Ch\naZ9/CneIZSjtwM07uChpm4BjNsrF87wLF4XxNqIap0vJ10eA9a3WiiFSG2pbkVYh\n79NFHb0bYfOxr/Z3Jq0sBKSz1QKBgQDNphhjqUWMkSOL4v0fL8ayBbJfPWSIPK0I\n3usqVgz4+i2WX8I1zghiNtcnMMICrVxZYbj+wEq3MbelhYVfxf8dQjQ6zwat49DM\n4KKhc0FnpP44eViPoKwqqTX5kAfcKOHbSgZpXmc0AOG/akmTLsVotAbT527AcVjz\nhGb3d6x1nQKBgQDPG2puWO+MlO7aXEQZu80XK0k4mphXd9JBgrhhOhnDhMRPpauj\ndFDe4jC5nVyXJMl0xGTlb8Y8hXhBniSd8GZ22XQLcenpUAnvBqF/GqCMU9akMBfp\nD1XzFESAF2t8eZcFxC4FXgA/NazbInYRhKDyNJkmGwQElI+HgSRZaDKERQKBgHIv\naFll8qUTLZ6NgahgWb4dJaZ2KyzuK9HCHOdb8kYIe2mEcAx6AvOtqZcsHn1oDt/e\nP97LnHDNnT+9vImqIXX4fZGtw/KnjRdFH2fv3AAVf8aRshfFyfLCE6MnUwXueUHO\nf3LgJQOd/brP5Fxh2uDBHQ1p8nfON+q2uIltnIeNAoGAJLSrFgjsMxxk83TSMKjC\nmDrohWO4bJdlGlEAxDWYnyYw/oA4oX+tivCQ/++7P0/u/Xaf3ijDgFl5qu6+lUGA\nMjPjmmwaIjAmhYs0rvTcree9L/Cqm/fBk+wgY3SnUDt/Q2YKNk3DLB5GKQeG0qgM\n5ex35GhS9DIh4QkFHARd3do=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-wemo3@nasfam-gas-pay.iam.gserviceaccount.com",
  "client_id": "113641575640490717064",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wemo3%40nasfam-gas-pay.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export default db;
