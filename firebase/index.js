import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut
} from 'firebase/auth';
import { child, get, getDatabase, goOnline, ref } from 'firebase/database';
import {
  doc,
  getDoc,
  initializeFirestore,
  onSnapshot,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import app from './config';
                            //<token>,'google'
const signInWithToken = async (token, type) => {
  const auth = getAuth(app);
  let credential;
  if (type === 'google') {
    credential = GoogleAuthProvider.credential(token, null);
  }
  const result = await signInWithCredential(auth, credential).catch(function (error) {
    // Handle Errors here.
    const errorCode = error.code;
    if (errorCode === 'auth/account-exists-with-different-credential') {
      throw new Error('Email already associated with another account.');
      // Handle account linking here, if using.
    } else {
      console.error('Error while trying to sign in with credentials: ', error);
      throw new Error(error)
    }
  });
  return result?.user;
};


const checkUserStatus = () => {
  console.log('checkUserStatus')
  const auth = getAuth(app);
  return new Promise((resolve, reject) => {
    try {
      auth.onAuthStateChanged(user => {
        if (user) {
          console.log('user', user)
          resolve(user)
        } else {
          resolve(null)
        }
      })
    } catch (err) {
      reject(err)
    }
  });
}

const subscribe = async (uid, accessToken, callback) => {
  const app = getApp();
  const database = getDatabase(app);
  const firestore = initializeFirestore(app, {});
  goOnline(database);
  const dbRef = ref(database);
  const charNames = await getSnapshot(dbRef, `_uid/${uid}`);

  let serverVars;
  if (firestore?.type === 'firestore') {
    const res = await getDoc(doc(firestore, '_vars', '_vars'));
    if (res.exists()) {
      serverVars = res.data();
    }
  }
  if (charNames?.length > 0) {
    return onSnapshot(doc(firestore, '_data', uid),
      { includeMetadataChanges: true }, async (doc) => {
        if (doc.exists()) {
          const cloudsave = doc.data();
          callback(cloudsave, serverVars, uid, accessToken);
        }
      }, (err) => {
        console.error('Error has occurred on subscribe', err);
      });
  }
}

const getSnapshot = async (dbRef, id) => {
  try {
    const snapshot = await get(child(dbRef, id))
    if (snapshot && snapshot.exists()) {
      return snapshot.val();
    } else {
      console.error(`No data available for key ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error while fetching data for key ${id}: `, error);
    return null;
  }
}

const userSignOut = async () => {
  const auth = getAuth(app);
  await signOut(auth).then(() => {
    console.info('Logged off successfully');
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error(`Error while logging out: ${errorCode}`, errorMessage);
  });
}

export {
  signInWithToken,
  subscribe,
  checkUserStatus,
  userSignOut
}