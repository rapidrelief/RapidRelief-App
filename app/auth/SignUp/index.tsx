// import React from 'react';
// import { ScrollView } from 'react-native';
// import SignUpF from '../screens/LogSign/SignUpF';

// export default function SignUp() {
//   return (
//     <ScrollView
//       className="flex-1 bg-[#1a49ce]"
//       contentContainerStyle={{ flexGrow: 1 }}
//     >
//       <SignUpF />
//     </ScrollView>
//   );
// }
import SignUpScreen from "@/app/screens/Sign/SignUpScreen";

export default function SignUpRoute() {
  return <SignUpScreen />;
}