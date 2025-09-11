## Getting Started

### Environment Variables

Set up a firebase project with a hazard-free guide('setup-firebase-project') at https://qf.orangeredcurve.com/en/docs

Create a `.env` file in the root directory and add the following Firebase configuration:

```

NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
```

### Local Package Setup

1. Change the local package version in `package.json` as needed
2. Place the package (tgz file) in the root of the project directory

### Development Server

First, run the development server(use npm use different syntax for local file):

```bash

pnpm install
# start local server
pnpm dev
```
