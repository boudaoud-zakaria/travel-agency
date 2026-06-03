import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { initializeDatabase, db, toJSON } from "./db";
import {
  users, travelPackages, reservations, reservationLogs,
  employeeSchedules, agencySettings, testimonials, activityLogs, employeeStats,
} from "./schema";

async function seed() {
  await initializeDatabase();
  console.log("Seeding database...\n");

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const empPassword = await bcrypt.hash("Employee@123", 10);

  await db.insert(users).values([
    { email: "admin@travelgenius.dz", password: adminPassword, name: "Super Admin", phone: "0550000000", role: "SUPER_ADMIN", isActive: true },
    { email: "amine@travelgenius.dz", password: empPassword, name: "Amine Benali", phone: "0551111111", role: "EMPLOYEE", isActive: true },
    { email: "sara@travelgenius.dz", password: empPassword, name: "Sara Khelifi", phone: "0552222222", role: "EMPLOYEE", isActive: true },
    { email: "karim@travelgenius.dz", password: empPassword, name: "Karim Meziane", phone: "0553333333", role: "EMPLOYEE", isActive: true },
    { email: "nadia@travelgenius.dz", password: empPassword, name: "Nadia Hamidi", phone: "0554444444", role: "EMPLOYEE", isActive: false },
  ]);
  console.log("✓ Users created (admin@travelgenius.dz / Admin@123)");

  // ── Employee Schedules ────────────────────────────────────────────────────
  const createdUsers = await db.select().from(users);
  const employees = createdUsers.filter(u => u.role === "EMPLOYEE");

  for (const [i, emp] of employees.entries()) {
    await db.insert(employeeSchedules).values({
      employeeId: emp.id,
      packageIds: toJSON([1, 2, 3].slice(0, i + 1)),
      shiftStart: i % 2 === 0 ? "08:00" : "10:00",
      shiftEnd: i % 2 === 0 ? "17:00" : "19:00",
      isOnLeave: i === 3,
    });
  }
  console.log("✓ Employee schedules created");

  // ── Travel Packages ───────────────────────────────────────────────────────
  const thirtyDays  = new Date(Date.now() + 30 * 86400000).toISOString();
  const fifteenDays = new Date(Date.now() + 15 * 86400000).toISOString();
  const fortyFiveDays = new Date(Date.now() + 45 * 86400000).toISOString();
  const tenDays     = new Date(Date.now() + 10 * 86400000).toISOString();
  const twentyDays  = new Date(Date.now() + 20 * 86400000).toISOString();
  const twentyFiveDays = new Date(Date.now() + 25 * 86400000).toISOString();
  const sixtyDays   = new Date(Date.now() + 60 * 86400000).toISOString();
  const ninetyDays  = new Date(Date.now() + 90 * 86400000).toISOString();

  await db.insert(travelPackages).values([
    {
      titleAr: "استكشاف الصحراء - طاسيلي ناجر", titleFr: "Expédition Sahara - Tassili N'Ajjer", titleEn: "Sahara Expedition - Tassili N'Ajjer",
      descAr: "رحلة استكشافية في قلب الصحراء الكبرى، اكتشف النقوش الصخرية والمناظر الطبيعية الخلابة.",
      descFr: "Un voyage d'exploration au cœur du Sahara, découvrez les gravures rupestres et des paysages époustouflants.",
      descEn: "An exploratory journey into the heart of the Sahara, discover rock carvings and breathtaking landscapes.",
      destination: "Djanet, Algeria", type: "DOMESTIC", pricePerPerson: "125000", durationDays: 7, maxCapacity: 12,
      images: toJSON(["https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800"]),
      status: "ACTIVE", departureDates: toJSON([thirtyDays, sixtyDays]),
      inclusions: toJSON(["Guide", "Full Board", "4x4 Transport", "Camping Gear"]),
      exclusions: toJSON(["Flights to Djanet"]),
      requirements: toJSON(["Age between 18 and 55 years", "Valid ID card (NIN)", "Medical fitness certificate"]),
      itinerary: toJSON([
        { day: 1, title: "Arrival in Djanet", description: "Welcome at the airport and transfer to the starting point." },
        { day: 2, title: "Tassili Plateau", description: "Hiking through the ancient rock formations." },
        { day: 3, title: "Rock Art Sites", description: "Visit prehistoric rock paintings." },
        { day: 7, title: "Departure", description: "Return to Djanet and flight home." },
      ]),
      rating: "5.0",
    },
    {
      titleAr: "مغامرة جبال جرجرة", titleFr: "Aventure dans le Djurdjura", titleEn: "Djurdjura Mountain Adventure",
      descAr: "تسلق وتنزّه في جبال جرجرة الخلابة واستمتع بالطبيعة العذراء.",
      descFr: "Randonnée et escalade dans les magnifiques montagnes du Djurdjura.",
      descEn: "Hiking and climbing in the magnificent Djurdjura mountains.",
      destination: "Kabylie, Algeria", type: "DOMESTIC", pricePerPerson: "45000", durationDays: 4, maxCapacity: 20,
      images: toJSON(["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"]),
      status: "ACTIVE", departureDates: toJSON([fifteenDays, fortyFiveDays]),
      inclusions: toJSON(["Accommodation", "Mountain Guide", "Meals"]),
      exclusions: toJSON(["Personal equipment"]),
      requirements: toJSON(["Physical fitness certificate", "Valid ID card"]),
      itinerary: toJSON([]), rating: "4.8",
    },
    {
      titleAr: "جولة الآثار الرومانية", titleFr: "Circuit des Ruines Romaines", titleEn: "Roman Ruins Discovery",
      descAr: "رحلة عبر الزمن لزيارة تيمقاد وجميلة من أجمل المواقع الرومانية في إفريقيا.",
      descFr: "Un voyage dans le temps pour visiter Timgad et Djémila.",
      descEn: "A journey through time to visit Timgad and Djémila, among the finest Roman sites in Africa.",
      destination: "Batna & Setif, Algeria", type: "DOMESTIC", pricePerPerson: "38000", durationDays: 3, maxCapacity: 30,
      images: toJSON(["https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"]),
      status: "ACTIVE", departureDates: toJSON([fortyFiveDays, ninetyDays]),
      inclusions: toJSON(["Entry Tickets", "Expert Guide", "Transport"]),
      exclusions: toJSON([]), requirements: toJSON(["Valid ID card required", "Age 12+"]),
      itinerary: toJSON([]), rating: "4.9",
    },
    {
      titleAr: "سحر الساحل الشرقي", titleFr: "Charm de la Côte Est", titleEn: "East Coast Charm",
      descAr: "استكشف جمال عنابة والقالة والحديقة الوطنية المذهلة.",
      descFr: "Explorez la beauté d'Annaba, El Kala et son parc national.",
      descEn: "Explore the beauty of Annaba, El Kala and its exceptional national park.",
      destination: "Annaba & El Kala, Algeria", type: "DOMESTIC", pricePerPerson: "52000", durationDays: 5, maxCapacity: 25,
      images: toJSON(["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"]),
      status: "ACTIVE", departureDates: toJSON([tenDays, thirtyDays]),
      inclusions: toJSON(["Hotel Stay", "Boat Trip", "Breakfast"]),
      exclusions: toJSON([]), requirements: toJSON(["Swimming gear recommended"]),
      itinerary: toJSON([]), rating: "4.7",
    },
    {
      titleAr: "قسنطينة: مدينة الجسور", titleFr: "Constantine: Ville des Ponts", titleEn: "Constantine: City of Bridges",
      descAr: "اكتشف تاريخ وثقافة المدينة المعلقة وجمال جسورها الفريدة.",
      descFr: "Découvrez l'histoire et la culture de la ville suspendue.",
      descEn: "Discover the history and culture of the suspended city and its unique bridges.",
      destination: "Constantine, Algeria", type: "DOMESTIC", pricePerPerson: "32000", durationDays: 3, maxCapacity: 40,
      images: toJSON(["https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800"]),
      status: "ACTIVE", departureDates: toJSON([twentyDays, fifteenDays]),
      inclusions: toJSON(["Guided City Tour", "Lunch at traditional restaurant"]),
      exclusions: toJSON([]), requirements: toJSON(["Comfortable walking shoes"]),
      itinerary: toJSON([]), rating: "4.6",
    },
    {
      titleAr: "جوهرة الغرب - وهران", titleFr: "Le Bijou de l'Ouest - Oran", titleEn: "Gem of the West - Oran",
      descAr: "استمتع بالحياة العصرية والتاريخ العريق في عاصمة الراي وهران.",
      descFr: "Profitez de la vie moderne et de l'histoire ancienne dans la capitale du Raï.",
      descEn: "Enjoy modern life and ancient history in the capital of Raï, Oran.",
      destination: "Oran, Algeria", type: "DOMESTIC", pricePerPerson: "62000", durationDays: 5, maxCapacity: 50,
      images: toJSON(["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"]),
      status: "ACTIVE", departureDates: toJSON([twentyFiveDays, sixtyDays]),
      inclusions: toJSON(["Resort Stay", "City Tour", "Beach Access"]),
      exclusions: toJSON([]), requirements: toJSON(["Valid ID card", "Check-in at 2 PM"]),
      itinerary: toJSON([]), rating: "4.8",
    },
    {
      titleAr: "رحلة الحج المباركة", titleFr: "Pèlerinage du Hajj", titleEn: "Blessed Hajj Pilgrimage",
      descAr: "رحلة روحانية مباركة لأداء فريضة الحج في بيت الله الحرام.",
      descFr: "Un voyage spirituel béni pour accomplir le pèlerinage du Hajj à La Mecque.",
      descEn: "A blessed spiritual journey to perform the Hajj pilgrimage in Mecca.",
      destination: "Mecca & Medina, Saudi Arabia", type: "HAJJ", pricePerPerson: "850000", durationDays: 21, maxCapacity: 45,
      images: toJSON(["https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800"]),
      status: "ACTIVE", departureDates: toJSON([ninetyDays]),
      inclusions: toJSON(["Visa", "Round-trip flights", "Hotel near Haram", "Guide", "Full Board"]),
      exclusions: toJSON(["Personal expenses", "Travel insurance"]),
      requirements: toJSON(["Valid passport (6 months+)", "Meningitis vaccination", "Age 18+"]),
      itinerary: toJSON([]), rating: "5.0",
    },
    {
      titleAr: "العمرة المباركة", titleFr: "Omra Bénie", titleEn: "Blessed Umrah",
      descAr: "رحلة عمرة مباركة لزيارة بيت الله الحرام طوال العام.",
      descFr: "Un voyage de Omra béni pour visiter La Mecque tout au long de l'année.",
      descEn: "A blessed Umrah trip to visit Mecca throughout the year.",
      destination: "Mecca & Medina, Saudi Arabia", type: "UMRAH", pricePerPerson: "320000", durationDays: 10, maxCapacity: 30,
      images: toJSON(["https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800"]),
      status: "ACTIVE", departureDates: toJSON([tenDays, thirtyDays, sixtyDays]),
      inclusions: toJSON(["Visa", "Flights", "Hotel", "Transport", "Guide"]),
      exclusions: toJSON(["Personal expenses"]),
      requirements: toJSON(["Valid passport", "Meningitis vaccination"]),
      itinerary: toJSON([]), rating: "4.9",
    },
  ]);
  console.log("✓ Travel packages created (8 packages)");

  // ── Sample Reservations ───────────────────────────────────────────────────
  const allUsers = await db.select().from(users);
  const allPkgs = await db.select().from(travelPackages);
  const empIds = allUsers.filter(u => u.role === "EMPLOYEE").map(u => u.id);

  const sampleReservations = [
    { code: "TG2024-AHMD01", clientName: "Ahmed Benali", clientEmail: "ahmed.benali@email.com", clientPhone: "0550001001", clientNIN: "198501201234567890", numberOfTravelers: 2, travelDate: thirtyDays, totalPriceDZD: "250000", status: "PENDING", packageId: allPkgs[0].id, assignedToId: empIds[0], notes: "Please call after 5 PM" },
    { code: "TG2024-FTMA02", clientName: "Fatma Zerrouki", clientEmail: "fatma.z@email.com", clientPhone: "0551002002", clientNIN: "199203101234567891", numberOfTravelers: 1, travelDate: fifteenDays, totalPriceDZD: "45000", status: "CONFIRMED", packageId: allPkgs[1].id, assignedToId: empIds[0] },
    { code: "TG2024-KARIM03", clientName: "Karim Amrani", clientEmail: "karim.a@email.com", clientPhone: "0552003003", clientNIN: "199107201234567892", numberOfTravelers: 3, travelDate: fortyFiveDays, totalPriceDZD: "114000", status: "IN_REVIEW", packageId: allPkgs[2].id, assignedToId: empIds[1] || empIds[0] },
    { code: "TG2024-MNIR04", clientName: "Mounir Tlemcani", clientEmail: "mounir.t@email.com", clientPhone: "0553004004", clientNIN: "198812011234567893", numberOfTravelers: 4, travelDate: twentyDays, totalPriceDZD: "208000", status: "REJECTED", packageId: allPkgs[3].id, assignedToId: empIds[1] || empIds[0], rejectionReason: "Incomplete documentation" },
    { code: "TG2024-AMEL05", clientName: "Amel Bouzid", clientEmail: "amel.b@email.com", clientPhone: "0554005005", clientNIN: "199508121234567894", numberOfTravelers: 2, travelDate: twentyFiveDays, totalPriceDZD: "124000", status: "CONFIRMED", packageId: allPkgs[4].id, assignedToId: empIds[2] || empIds[0] },
    { code: "TG2024-NOUR06", clientName: "Nour Hadjadj", clientEmail: "nour.h@email.com", clientPhone: "0555006006", clientNIN: "200002031234567895", numberOfTravelers: 1, travelDate: tenDays, totalPriceDZD: "62000", status: "PENDING", packageId: allPkgs[5].id, assignedToId: empIds[0] },
    { code: "TG2024-HAJJ07", clientName: "Hassan Kaci", clientEmail: "hassan.k@email.com", clientPhone: "0556007007", clientNIN: "196504011234567896", numberOfTravelers: 2, travelDate: ninetyDays, totalPriceDZD: "1700000", status: "IN_REVIEW", packageId: allPkgs[6].id, assignedToId: empIds[1] || empIds[0], specialRequests: "Need wheelchair assistance" },
    { code: "TG2024-UMRA08", clientName: "Samira Belkacemi", clientEmail: "samira.b@email.com", clientPhone: "0557008008", clientNIN: "197808221234567897", numberOfTravelers: 1, travelDate: thirtyDays, totalPriceDZD: "320000", status: "COMPLETED", packageId: allPkgs[7].id, assignedToId: empIds[2] || empIds[0] },
  ];

  for (const r of sampleReservations) {
    const [inserted] = await db.insert(reservations).values(r as Parameters<typeof db.insert>[1]).returning();
    await db.insert(reservationLogs).values({ reservationId: inserted.id, toStatus: r.status, note: "Initial status" });
  }
  console.log("✓ Sample reservations created (8 reservations)");

  // ── Agency Settings ───────────────────────────────────────────────────────
  await db.insert(agencySettings).values({
    nameAr: "وكالة سفر جينيوس", nameFr: "Agence de Voyage Genius", nameEn: "Travel Genius Agency",
    address: "123 Rue Didouche Mourad, Algiers 16000",
    phone: "+213 21 000 000", email: "contact@travelgenius.dz",
    socialLinks: toJSON({ facebook: "https://facebook.com/travelgenius", instagram: "https://instagram.com/travelgenius" }),
    heroTitleAr: "اكتشف الجزائر الرائعة", heroTitleFr: "Découvrez l'Algérie Magnifique", heroTitleEn: "Discover Magnificent Algeria",
    heroSubtitleAr: "رحلات لا تُنسى إلى أجمل الوجهات",
    heroSubtitleFr: "Des voyages inoubliables vers les plus belles destinations",
    heroSubtitleEn: "Unforgettable journeys to the most beautiful destinations",
  });
  console.log("✓ Agency settings created");

  // ── Testimonials ──────────────────────────────────────────────────────────
  await db.insert(testimonials).values([
    { clientName: "Ahmed Benali", content: "Fantastic experience! The Sahara expedition was beyond my expectations. The guides were professional.", rating: 5, packageId: allPkgs[0].id, isApproved: true },
    { clientName: "Fatma Zerrouki", content: "The Djurdjura hike was incredible. Breathtaking views and a warm team. Will book again!", rating: 5, packageId: allPkgs[1].id, isApproved: true },
    { clientName: "Mounir Tlemcani", content: "Great tour of Roman ruins. The guide was very knowledgeable about history.", rating: 4, packageId: allPkgs[2].id, isApproved: true },
    { clientName: "Samira Belkacemi", content: "The Umrah package was perfectly organized. Hotels were close to the Haram.", rating: 5, packageId: allPkgs[7].id, isApproved: true },
  ]);
  console.log("✓ Testimonials created");

  // ── Employee Stats ────────────────────────────────────────────────────────
  const activeEmps = allUsers.filter(u => u.role === "EMPLOYEE" && u.isActive);
  const currentYear = new Date().getFullYear();

  for (const emp of activeEmps) {
    for (let m = 1; m <= 12; m++) {
      const handled = Math.floor(Math.random() * 20) + 5;
      const confirmed = Math.floor(handled * (0.6 + Math.random() * 0.3));
      const rejected = Math.floor(handled * Math.random() * 0.2);
      const rate = Math.round((confirmed / handled) * 100);
      await db.insert(employeeStats).values({
        employeeId: emp.id, month: m, year: currentYear,
        handled, confirmed, rejected,
        avgHandlingTimeHours: parseFloat((Math.random() * 5 + 1).toFixed(1)),
        confirmationRate: rate,
        performanceScore: Math.min(100, rate + Math.floor(Math.random() * 10)),
      });
    }
  }
  console.log("✓ Employee stats created");

  // ── Activity Logs ─────────────────────────────────────────────────────────
  const adminUser = allUsers.find(u => u.role === "SUPER_ADMIN")!;
  await db.insert(activityLogs).values([
    { userId: adminUser.id, employeeName: adminUser.name, action: "System initialized and seeded with demo data", entityType: "settings" },
    { userId: empIds[0], employeeName: "Amine Benali", action: "Confirmed reservation TG2024-FTMA02", entityType: "reservation" },
    { userId: empIds[1] || empIds[0], employeeName: "Sara Khelifi", action: "Rejected reservation TG2024-MNIR04 — incomplete documents", entityType: "reservation" },
  ]);
  console.log("✓ Activity logs created");

  console.log("\n✅ Database seeded successfully!");
  console.log("   Admin:    admin@travelgenius.dz / Admin@123");
  console.log("   Employee: amine@travelgenius.dz / Employee@123");
  console.log("   Employee: sara@travelgenius.dz  / Employee@123\n");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
