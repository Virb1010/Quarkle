// import { SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
// import TagInput from "@/src/components/Settings/TagInput";
// import { useEffect, useState } from "react";
// import { getUserProfile, updateUserProfile } from "@/src/helpers/dbFunctions";
// import { useAuth0 } from "@auth0/auth0-react";
// import { plumeAPI } from "@/src/helpers/ServiceHelper";

// const userProfessionOptions = ["Author", "Blogger", "Student", "Researcher", "Hobbyist", "Other"];
// const userAgeOptions = ["18-24", "25-34", "35-44", "45-54", "55+"];

// export default function UserProfileContent({ setSelected }) {
//   const { getAccessTokenSilently } = useAuth0();
//   const [userProfession, setUserProfession] = useState(null);
//   const [userAge, setUserAge] = useState(null);
//   // Keep track of the original profile so we can check if it has changed
//   const [originalProfile, setOriginalProfile] = useState({ profession: null, age: null });

//   useEffect(() => {
//     async function fetchProfile() {
//       const profile = await getUserProfile({ getAccessTokenSilently, plumeAPI });
//       setUserAge(profile?.age);
//       setUserProfession(profile?.profession);
//       setOriginalProfile({ profession: profile?.profession, age: profile?.age });
//     }

//     fetchProfile();
//   }, [getAccessTokenSilently]);

//   // Update profile in the database when userProfession or userAge changes
//   useEffect(() => {
//     const hasProfileChanged = userProfession !== originalProfile.profession || userAge !== originalProfile.age;
//     if (hasProfileChanged) {
//       updateUserProfile({ getAccessTokenSilently, plumeAPI, userProfession, userAge });
//     }
//   }, [userProfession, userAge, getAccessTokenSilently, originalProfile]);

//   return (
//     <SheetHeader>
//       <SheetTitle className="text-white">User Profile</SheetTitle>

//       <p className="text-center text-sm text-gray-500">
//         This information helps us understand our users better. We will never share this information with anyone.
//       </p>
//       <div className="py-3"></div>

//       <p className="text-center text-lg font-semibold">Profession</p>
//       <div className="flex flex-wrap items-center justify-center gap-2">
//         {userProfessionOptions.map((profession) => (
//           <TagInput key={profession} tag={profession} selected={userProfession} onClick={() => setUserProfession(profession)} />
//         ))}
//       </div>

//       <div className="py-5"></div>

//       <p className="text-center text-lg font-semibold">Age</p>
//       <div className="flex flex-wrap items-center justify-center gap-2">
//         {userAgeOptions.map((age) => (
//           <TagInput key={age} tag={age} selected={userAge} onClick={() => setUserAge(age)} />
//         ))}
//       </div>
//     </SheetHeader>
//   );
// }
