// functions/auth.ts
import auth from "@react-native-firebase/auth";

export const signUp = (email: string, password: string) =>
  auth().createUserWithEmailAndPassword(email.trim().toLowerCase(), password);

export const signIn = (email: string, password: string) =>
  auth().signInWithEmailAndPassword(email.trim().toLowerCase(), password);

export const login = (email: string, password: string) =>
  auth().signInWithEmailAndPassword(email.trim().toLowerCase(), password);

export const logout = () => auth().signOut();
