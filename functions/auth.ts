// auth.ts
import auth from '@react-native-firebase/auth';

export const signUp = (email: string, password: string) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export async function signIn(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email, password);
}

export const login = (email: string, password: string) => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const logout = () => {
  return auth().signOut();
};
