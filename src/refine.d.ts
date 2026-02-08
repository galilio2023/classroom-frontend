import { User } from "./types";

declare module "@refinedev/core" {
  // By augmenting the AuthIdentity interface, we are telling Refine
  // that the `getIdentity` method will return our custom `User` type.
  // This provides global type safety for the user object.
  interface AuthIdentity extends User {}
}
