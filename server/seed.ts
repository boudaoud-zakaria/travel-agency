
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users, travelPackages, reservations, testimonials, agencySettings, reservationLogs, userRoles, packageTypes, reservationStatus, packageStatus } from "@shared/schema";
import { addDays, subDays } from "date-fns";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  // 1. Users
  const adminPassword = await hashPassword("Admin@123456");
  const employeePassword = await hashPassword("Employee@123");

  await db.insert(users).values([
    {
      email: "admin@rihla.dz",
      password: adminPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      phone: "0550000000",
      isActive: true,
    },
    {
      email: "amine@rihla.dz",
      password: employeePassword,
      name: "Amine Employee",
      role: "EMPLOYEE",
      phone: "0551111111",
      isActive: true,
    },
    {
      email: "sarah@rihla.dz",
      password: employeePassword,
      name: "Sarah Employee",
      role: "EMPLOYEE",
      phone: "0552222222",
      isActive: true,
    },
    {
      email: "karim@rihla.dz",
      password: employeePassword,
      name: "Karim Employee",
      role: "EMPLOYEE",
      phone: "0553333333",
      isActive: true,
    },
  ]).onConflictDoNothing();

  const allUsers = await db.select().from(users);
  const employeeIds = allUsers.filter(u => u.role === "EMPLOYEE").map(u => u.id);

  // 2. Travel Packages
  const packages = [
    // Hajj
    {
      titleAr: "باقة الحج المميزة",
      titleFr: "Forfait Hajj Premium",
      titleEn: "Premium Hajj Package",
      descAr: "رحلة حج فاخرة مع إقامة قريبة من الحرم",
      descFr: "Voyage Hajj de luxe avec hébergement proche du Haram",
      descEn: "Luxury Hajj journey with accommodation near Haram",
      destination: "Mecca & Medina",
      type: "HAJJ",
      pricePerPerson: "850000",
      durationDays: 21,
      maxCapacity: 50,
      images: ["https://images.unsplash.com/photo-1565552629477-e276365b2672?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 60).toISOString(), addDays(new Date(), 65).toISOString()],
      inclusions: ["Visa", "Flights", "5-star Hotel", "Transport", "Meals"],
      exclusions: ["Personal expenses"],
      itinerary: [
        { day: 1, title: "Arrival", description: "Arrival at Jeddah airport and transfer to Mecca" },
        { day: 2, title: "Umrah", description: "Perform Umrah rituals" }
      ],
      rating: "5.0"
    },
    {
      titleAr: "باقة الحج الاقتصادية",
      titleFr: "Forfait Hajj Économique",
      titleEn: "Economy Hajj Package",
      descAr: "رحلة حج ميسرة بأسعار مناسبة",
      descFr: "Voyage Hajj abordable",
      descEn: "Affordable Hajj journey",
      destination: "Mecca & Medina",
      type: "HAJJ",
      pricePerPerson: "650000",
      durationDays: 25,
      maxCapacity: 100,
      images: ["https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 60).toISOString()],
      inclusions: ["Visa", "Flights", "3-star Hotel", "Transport"],
      exclusions: ["Meals", "Personal expenses"],
      itinerary: [{ day: 1, title: "Arrival", description: "Arrival in Mecca" }],
      rating: "4.5"
    },
    // Umrah
    {
      titleAr: "عمرة رمضان",
      titleFr: "Omra Ramadan",
      titleEn: "Ramadan Umrah",
      descAr: "عمرة في شهر رمضان المبارك",
      descFr: "Omra pendant le mois sacré de Ramadan",
      descEn: "Umrah during the holy month of Ramadan",
      destination: "Mecca & Medina",
      type: "UMRAH",
      pricePerPerson: "250000",
      durationDays: 15,
      maxCapacity: 40,
      images: ["https://images.unsplash.com/photo-1537160759499-1065f3c950a7?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 30).toISOString()],
      inclusions: ["Visa", "Flights", "Hotel", "Transport"],
      exclusions: [],
      itinerary: [{ day: 1, title: "Arrival", description: "Arrival in Medina" }],
      rating: "4.8"
    },
    {
      titleAr: "عمرة المولد",
      titleFr: "Omra Mawlid",
      titleEn: "Mawlid Umrah",
      descAr: "عمرة بمناسبة المولد النبوي الشريف",
      descFr: "Omra à l'occasion du Mawlid",
      descEn: "Umrah for Mawlid",
      destination: "Mecca & Medina",
      type: "UMRAH",
      pricePerPerson: "180000",
      durationDays: 10,
      maxCapacity: 30,
      images: ["https://images.unsplash.com/photo-1580418425640-2728755a0cb8?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 15).toISOString()],
      inclusions: ["Visa", "Flights", "Hotel"],
      exclusions: [],
      itinerary: [{ day: 1, title: "Arrival", description: "Arrival in Jeddah" }],
      rating: "4.2"
    },
    // International
    {
      titleAr: "رحلة تركيا - إسطنبول",
      titleFr: "Voyage Turquie - Istanbul",
      titleEn: "Turkey Trip - Istanbul",
      descAr: "اكتشف سحر إسطنبول ومضيق البوسفور",
      descFr: "Découvrez la magie d'Istanbul et du Bosphore",
      descEn: "Discover the magic of Istanbul and Bosphorus",
      destination: "Istanbul, Turkey",
      type: "INTERNATIONAL",
      pricePerPerson: "120000",
      durationDays: 8,
      maxCapacity: 25,
      images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 45).toISOString()],
      inclusions: ["Flights", "Hotel", "Tours"],
      exclusions: ["Visa fees"],
      itinerary: [{ day: 1, title: "Arrival", description: "Transfer to hotel" }],
      rating: "4.7"
    },
    {
      titleAr: "ماليزيا الساحرة",
      titleFr: "Malaisie Enchanteresse",
      titleEn: "Enchanting Malaysia",
      descAr: "رحلة عائلية إلى كوالالمبور ولنكاوي",
      descFr: "Voyage en famille à Kuala Lumpur et Langkawi",
      descEn: "Family trip to Kuala Lumpur and Langkawi",
      destination: "Malaysia",
      type: "INTERNATIONAL",
      pricePerPerson: "280000",
      durationDays: 12,
      maxCapacity: 20,
      images: ["https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 90).toISOString()],
      inclusions: ["Flights", "Resorts", "Transport"],
      exclusions: [],
      itinerary: [{ day: 1, title: "Arrival", description: "Arrival in KL" }],
      rating: "4.9"
    },
    // Domestic
    {
      titleAr: "صحراء تاغيت",
      titleFr: "Désert de Taghit",
      titleEn: "Taghit Desert",
      descAr: "استمتع بسحر الصحراء الجزائرية في تاغيت",
      descFr: "Profitez de la magie du désert algérien à Taghit",
      descEn: "Enjoy the magic of Algerian desert in Taghit",
      destination: "Taghit, Algeria",
      type: "DOMESTIC",
      pricePerPerson: "45000",
      durationDays: 4,
      maxCapacity: 30,
      images: ["https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 10).toISOString()],
      inclusions: ["Bus Transport", "Traditional Guest House", "Meals"],
      exclusions: [],
      itinerary: [{ day: 1, title: "Arrival", description: "Arrival in Taghit" }],
      rating: "4.6"
    },
    {
      titleAr: "جيجل - الكورنيش",
      titleFr: "Jijel - La Corniche",
      titleEn: "Jijel - The Corniche",
      descAr: "عطلة صيفية في شواطئ جيجل الخلابة",
      descFr: "Vacances d'été sur les plages magnifiques de Jijel",
      descEn: "Summer vacation on beautiful Jijel beaches",
      destination: "Jijel, Algeria",
      type: "DOMESTIC",
      pricePerPerson: "35000",
      durationDays: 7,
      maxCapacity: 40,
      images: ["https://images.unsplash.com/photo-1605553644190-674510b65621?q=80&w=1000&auto=format&fit=crop"],
      status: "ACTIVE",
      departureDates: [addDays(new Date(), 120).toISOString()],
      inclusions: ["Hotel", "Breakfast"],
      exclusions: ["Transport"],
      itinerary: [{ day: 1, title: "Arrival", description: "Check-in at hotel" }],
      rating: "4.3"
    }
  ];

  const insertedPackages = await db.insert(travelPackages).values(packages as any).returning();

  // 3. Reservations
  const reservationsData = [];
  for (let i = 0; i < 20; i++) {
    const pkg = insertedPackages[Math.floor(Math.random() * insertedPackages.length)];
    const travelers = Math.floor(Math.random() * 4) + 1;
    const status = ["PENDING", "CONFIRMED", "IN_REVIEW", "REJECTED", "COMPLETED"][Math.floor(Math.random() * 5)];
    const assignedTo = employeeIds[Math.floor(Math.random() * employeeIds.length)];
    
    reservationsData.push({
      code: `RHL-2026-${String(i + 1).padStart(5, '0')}`,
      clientName: `Client ${i + 1}`,
      clientEmail: `client${i + 1}@example.com`,
      clientPhone: `055${String(i).padStart(7, '0')}`,
      clientNIN: `12345678901234567${i}`,
      numberOfTravelers: travelers,
      travelDate: new Date(pkg.departureDates[0]),
      totalPriceDZD: (Number(pkg.pricePerPerson) * travelers).toString(),
      status: status as any,
      packageId: pkg.id,
      assignedToId: status !== "PENDING" ? assignedTo : null,
      notes: "Auto-generated reservation",
      createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
    });
  }

  const insertedReservations = await db.insert(reservations).values(reservationsData).returning();

  // 4. Testimonials
  const testimonialsData = [
    { clientName: "Ahmed Benali", content: "Great service, highly recommended!", rating: 5, isApproved: true },
    { clientName: "Fatima Zohra", content: "Un voyage inoubliable, merci Rihla.", rating: 5, isApproved: true },
    { clientName: "John Doe", content: "Professional team and good prices.", rating: 4, isApproved: true },
    { clientName: "Samir Khelil", content: "Could be better organization.", rating: 3, isApproved: false },
    { clientName: "Amina T.", content: "Amazing Hajj experience.", rating: 5, isApproved: false },
  ];
  await db.insert(testimonials).values(testimonialsData);

  // 5. Agency Settings
  await db.insert(agencySettings).values({
    nameAr: "وكالة رحلة",
    nameFr: "Agence Rihla",
    nameEn: "Rihla Agency",
    address: "123 Rue Didouche Mourad, Algiers, Algeria",
    phone: "+213 21 00 00 00",
    email: "contact@rihla.dz",
    heroTitleAr: "اكتشف العالم معنا",
    heroTitleFr: "Découvrez le monde avec nous",
    heroTitleEn: "Discover the world with us",
    heroSubtitleAr: "أفضل العروض والوجهات بأسعار تنافسية",
    heroSubtitleFr: "Les meilleures offres et destinations à des prix compétitifs",
    heroSubtitleEn: "Best offers and destinations at competitive prices",
  });

  console.log("Seeding completed!");
}

seed().catch(console.error);
