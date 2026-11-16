import type { RentalItem, Room, RoommateProfile } from "./types";

export const DEMO_ROOMMATES: RoommateProfile[] = [
  { id: "rm-1", name: "Aarav Mehta", age: 24, gender: "male", occupation: "Software Engineer", city: "Bengaluru", budgetMin: 8000, budgetMax: 12000, moveInDate: "2026-12-01", food: "veg", smoking: "no", alcohol: "no", sleepTime: "23:00", wakeTime: "07:00", cleanliness: 4, workHours: "9-6", wfh: "yes", pets: "no", guestsOk: "yes", languages: ["English", "Hindi"], bio: "Early riser, likes a quiet flat on weekdays and cooking on Sundays.", phoneVerified: true, createdAt: "2026-11-14", verified: true },
  { id: "rm-2", name: "Priya Nair", age: 26, gender: "female", occupation: "Product Designer", city: "Bengaluru", budgetMin: 10000, budgetMax: 15000, moveInDate: "2026-12-01", food: "veg", smoking: "no", alcohol: "no", sleepTime: "23:30", wakeTime: "07:30", cleanliness: 5, workHours: "9-6", wfh: "yes", pets: "no", guestsOk: "no", languages: ["English", "Malayalam"], bio: "Clean, organised, WFH most days. Looking for a calm flatmate in HSR.", phoneVerified: true, createdAt: "2026-11-13", verified: true },
  { id: "rm-3", name: "Rohan Shah", age: 23, gender: "male", occupation: "Student, MBA", city: "Mumbai", budgetMin: 7000, budgetMax: 10000, moveInDate: "2026-12-15", food: "non-veg", smoking: "no", alcohol: "yes", sleepTime: "00:30", wakeTime: "08:30", cleanliness: 3, workHours: "flexible", wfh: "no", pets: "no", guestsOk: "yes", languages: ["English", "Hindi", "Gujarati"], bio: "Night owl, gym in the morning, out most weekends.", phoneVerified: true, createdAt: "2026-11-12" },
  { id: "rm-4", name: "Sneha Kulkarni", age: 25, gender: "female", occupation: "Data Analyst", city: "Pune", budgetMin: 8000, budgetMax: 11000, moveInDate: "2026-12-01", food: "veg", smoking: "no", alcohol: "no", sleepTime: "22:30", wakeTime: "06:30", cleanliness: 4, workHours: "9-6", wfh: "no", pets: "yes", guestsOk: "yes", languages: ["English", "Marathi", "Hindi"], bio: "Early bird, loves plants and a pet-friendly home.", phoneVerified: true, createdAt: "2026-11-11", verified: true },
  { id: "rm-5", name: "Kabir Singh", age: 27, gender: "male", occupation: "Marketing Manager", city: "Bengaluru", budgetMin: 12000, budgetMax: 18000, moveInDate: "2026-11-20", food: "non-veg", smoking: "yes", alcohol: "yes", sleepTime: "00:00", wakeTime: "08:00", cleanliness: 3, workHours: "flexible", wfh: "yes", pets: "no", guestsOk: "yes", languages: ["English", "Hindi"], bio: "Works flexible hours, hosts friends on weekends, splits chores fairly.", phoneVerified: false, createdAt: "2026-11-10" },
  { id: "rm-6", name: "Ananya Iyer", age: 24, gender: "female", occupation: "CA Trainee", city: "Delhi", budgetMin: 9000, budgetMax: 13000, moveInDate: "2026-12-10", food: "veg", smoking: "no", alcohol: "no", sleepTime: "23:00", wakeTime: "06:00", cleanliness: 5, workHours: "9-6", wfh: "no", pets: "no", guestsOk: "no", languages: ["English", "Hindi", "Tamil"], bio: "Studying for CA finals — needs a quiet place, in bed by 11.", phoneVerified: true, createdAt: "2026-11-09", verified: true },
];

export const DEMO_ROOMS: Room[] = [
  { id: "room-1", title: "Private room in 2BHK, HSR Layout", type: "room", city: "Bengaluru", locality: "HSR Layout", rent: 11000, deposit: 22000, furnishing: "semi-furnished", bhk: "2BHK", availableFrom: "2026-12-01", genderPref: "any", foodPref: "veg", smokingAllowed: false, petsAllowed: false, amenities: ["Wi-Fi", "Washing machine", "Fridge", "Power backup"], photos: [], ownerName: "Kiran R.", verified: true, createdAt: "2026-11-14" },
  { id: "room-2", title: "Furnished room near Manyata Tech Park", type: "room", city: "Bengaluru", locality: "Hebbal", rent: 9500, deposit: 19000, furnishing: "furnished", bhk: "3BHK", availableFrom: "2026-11-20", genderPref: "female", foodPref: "flexible", smokingAllowed: false, petsAllowed: true, amenities: ["Bed", "Wardrobe", "Wi-Fi", "Geyser"], photos: [], ownerName: "Meera S.", verified: true, createdAt: "2026-11-13" },
  { id: "room-3", title: "1BHK in Andheri West, 5 min to station", type: "flat", city: "Mumbai", locality: "Andheri West", rent: 33000, deposit: 44000, furnishing: "semi-furnished", bhk: "1BHK", availableFrom: "2026-12-01", genderPref: "any", foodPref: "non-veg", smokingAllowed: false, petsAllowed: false, amenities: ["Lift", "Security", "Water 24x7"], photos: [], ownerName: "Farhan K.", createdAt: "2026-11-12" },
  { id: "room-4", title: "PG room with food, Kothrud", type: "pg", city: "Pune", locality: "Kothrud", rent: 8000, deposit: 8000, furnishing: "furnished", bhk: "PG", availableFrom: "2026-11-25", genderPref: "male", foodPref: "veg", smokingAllowed: false, petsAllowed: false, amenities: ["Food included", "Wi-Fi", "Laundry"], photos: [], ownerName: "Suresh P.", verified: true, createdAt: "2026-11-11" },
];

export const DEMO_RENTALS: RentalItem[] = [
  { id: "rent-1", title: "Queen bed with storage", category: "furniture", pricePerMonth: 549, deposit: 1098, condition: "like-new", city: "Bengaluru", locality: "HSR Layout", ownerName: "Neha T.", photos: [], verified: true, createdAt: "2026-11-14" },
  { id: "rent-2", title: "Single-door fridge 190L", category: "appliance", pricePerMonth: 539, deposit: 1078, condition: "good", city: "Bengaluru", locality: "Koramangala", ownerName: "Arjun V.", photos: [], verified: true, createdAt: "2026-11-13" },
  { id: "rent-3", title: "Fully-automatic washing machine 7kg", category: "appliance", pricePerMonth: 725, deposit: 1450, condition: "like-new", city: "Bengaluru", locality: "HSR Layout", ownerName: "Neha T.", photos: [], verified: true, createdAt: "2026-11-13" },
  { id: "rent-4", title: "Study desk + chair set", category: "furniture", pricePerMonth: 299, deposit: 598, condition: "good", city: "Pune", locality: "Kothrud", ownerName: "Omkar D.", photos: [], createdAt: "2026-11-12" },
  { id: "rent-5", title: "Kitchen kit — induction, mixer, utensils", category: "daily", pricePerMonth: 349, deposit: 698, condition: "good", city: "Bengaluru", locality: "Indiranagar", ownerName: "Divya M.", photos: [], createdAt: "2026-11-12" },
  { id: "rent-6", title: "32-inch Smart TV", category: "electronics", pricePerMonth: 499, deposit: 998, condition: "like-new", city: "Mumbai", locality: "Andheri West", ownerName: "Rahul G.", photos: [], verified: true, createdAt: "2026-11-11" },
  { id: "rent-7", title: "3-seater sofa", category: "furniture", pricePerMonth: 636, deposit: 1272, condition: "good", city: "Bengaluru", locality: "Whitefield", ownerName: "Kavya S.", photos: [], createdAt: "2026-11-10" },
  { id: "rent-8", title: "Vacuum cleaner + iron combo", category: "daily", pricePerMonth: 199, deposit: 398, condition: "good", city: "Delhi", locality: "Lajpat Nagar", ownerName: "Vikram A.", photos: [], createdAt: "2026-11-10" },
];

export const DEMO_CITIES = ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai"];

export const DEMO_BROKERAGE_SAVED = DEMO_ROOMS.reduce((s, r) => s + r.rent, 0); // ₹61,500 in demo

export const DEMO_SQUADS = [
  { id: "squad-1", name: "HSR Hunters", target: "2BHK in HSR Layout", city: "Bengaluru", budgetPerPerson: 11000, members: ["Aarav Mehta", "Priya Nair"], maxMembers: 3, createdAt: "2026-11-13" },
  { id: "squad-2", name: "Whitefield Trio", target: "3BHK in Whitefield", city: "Bengaluru", budgetPerPerson: 12000, members: ["Kabir Singh"], maxMembers: 3, createdAt: "2026-11-12" },
  { id: "squad-3", name: "Andheri Duo", target: "2BHK in Andheri West", city: "Mumbai", budgetPerPerson: 16000, members: ["Rohan Shah", "Ananya Iyer"], maxMembers: 2, createdAt: "2026-11-11" },
];

export const DEMO_VERIFIED_COUNT =
  DEMO_ROOMMATES.filter((r) => r.verified).length +
  DEMO_ROOMS.filter((r) => r.verified).length +
  DEMO_RENTALS.filter((r) => r.verified).length; // 11 in demo
