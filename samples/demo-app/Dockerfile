# Dockerfile for visa-demo-app
#
# NOTE: APP_SECRET is intentionally NOT set here.
# This causes the first deployment to fail, triggering the VISA
# diagnosis → correction → redeployment workflow.
#
# After Bob diagnoses the failure and generates the correction,
# VISA will apply the fix (adding APP_SECRET to the Dockerfile or
# passing it as a --env flag) and redeploy.

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8080

# APP_SECRET is deliberately absent — the app will exit(1) on startup.
# VISA's correction step will add: ENV APP_SECRET=visa-demo-secret
CMD ["node", "server.js"]
