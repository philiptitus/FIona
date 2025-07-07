import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    region: "eu-north-1",
    userPoolId: "eu-north-1_FvSLormyO",
    userPoolWebClientId: "3cv6n93ibe6f3sfltfjrtf8j17",
    oauth: {
      domain: "eu-north-1fvslormyo.auth.eu-north-1.amazoncognito.com",
      scope: ["openid", "email", "profile"],
      redirectSignIn: "http://localhost:3000/",
      redirectSignOut: "http://localhost:3000/",
      responseType: "code",
    },
  },
}); 