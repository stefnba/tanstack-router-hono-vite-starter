// import { useCallback, useState } from 'react';
// import { AuthContext } from './context';

// const key = 'tanstack.auth.user';

// function getStoredUser() {
//     return localStorage.getItem(key);
// }

// function setStoredUser(user: string | null) {
//     if (user) {
//         localStorage.setItem(key, user);
//     } else {
//         localStorage.removeItem(key);
//     }
// }

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     const [user, setUser] = useState<string | null>(getStoredUser());
//     const isAuthenticated = !!user;

//     const logout = useCallback(async () => {
//         // await sleep(250);

//         setStoredUser(null);
//         setUser(null);
//     }, []);

//     const login = useCallback(async (username: string) => {
//         // await sleep(500);

//         setStoredUser(username);
//         setUser(username);
//     }, []);

//     const storedUser = getStoredUser();
//     if (storedUser) {
//         setUser(storedUser);

//         return (
//             <AuthContext.Provider
//                 value={{
//                     isAuthenticated,
//                     user: {
//                         id: '1',
//                         username: 'test',
//                         email: 'test@test.com',
//                     },
//                     status: 'loggedIn',
//                     login,
//                     logout,
//                 }}
//             >
//                 {children}
//             </AuthContext.Provider>
//         );
//     }
// }
