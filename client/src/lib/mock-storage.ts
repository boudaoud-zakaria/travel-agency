import {
    User, TravelPackage, Reservation, ReservationLog,
    ContactMessage
} from "@shared/schema";

// Simple local storage wrapper or in-memory for session
class MockStorage {
    private users: User[] = [
        {
            id: 1,
            email: "admin@rihla.dz",
            name: "Super Admin",
            role: "SUPER_ADMIN",
            isActive: true,
            createdAt: new Date(),
        },
        {
            id: 2,
            email: "amine@rihla.dz",
            name: "Amine Employee",
            role: "EMPLOYEE",
            isActive: true,
            createdAt: new Date(),
        }
    ];

    private packages: TravelPackage[] = [
        {
            id: 1,
            titleAr: "استكشاف الصحراء - طاسيلي ناجر",
            titleFr: "Expédition Sahara - Tassili N'Ajjer",
            titleEn: "Sahara Expedition - Tassili N'Ajjer",
            descAr: "رحلة استكشافية في قلب الصحراء الكبرى، اكتشف النقوش الصخرية والمناظر الطبيعية الخلابة.",
            descFr: "Un voyage d'exploration au cœur du Sahara, découvrez les gravures rupestres et des paysages époustouflants.",
            descEn: "An exploratory journey into the heart of the Sahara, discover rock carvings and breathtaking landscapes.",
            destination: "Djanet, Algeria",
            type: "DOMESTIC",
            pricePerPerson: "125000",
            durationDays: 7,
            maxCapacity: 12,
            images: ["https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800"],
            status: "ACTIVE",
            departureDates: [new Date(Date.now() + 30 * 86400000).toISOString()],
            inclusions: ["Guide", "Full Board", "4x4 Transport", "Camping Gear"],
            exclusions: ["Flights to Djanet"],
            requirements: ["Age between 18 and 55 years", "Valid ID card (NIN)", "Medical fitness certificate", "Previous hiking experience of 3+ months"],
            itinerary: [
                { day: 1, title: "Arrival in Djanet", description: "Welcome at the airport and transfer to the starting point." },
                { day: 2, title: "Tassili Plateau", description: "Hiking through the ancient rock formations." }
            ],
            rating: "5.0",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            titleAr: "مغامرة جبال جرجرة",
            titleFr: "Aventure dans le Djurdjura",
            titleEn: "Djurdjura Mountain Adventure",
            descAr: "تسلق وتنزّه في جبال جرجرة الخلابة واستمتع بالطبيعة العذراء.",
            descFr: "Randonnée et escalade dans les magnifiques montagnes du Djurdjura, au cœur de la nature sauvage.",
            descEn: "Hiking and climbing in the magnificent Djurdjura mountains, in the heart of wild nature.",
            destination: "Kabylie, Algeria",
            type: "DOMESTIC",
            pricePerPerson: "45000",
            durationDays: 4,
            maxCapacity: 20,
            images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"],
            status: "ACTIVE",
            departureDates: [new Date(Date.now() + 15 * 86400000).toISOString()],
            inclusions: ["Accommodation", "Mountain Guide", "Meals"],
            exclusions: [],
            requirements: ["Physical fitness certificate", "Valid ID card", "Appropriate mountain gear (boots, thermal layers)"],
            itinerary: [],
            rating: "4.8",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            titleAr: "جولة الآثار الرومانية",
            titleFr: "Circuit des Ruines Romaines",
            titleEn: "Roman Ruins Discovery",
            descAr: "رحلة عبر الزمن لزيارة تيمقad وجميلة، من أجمل المواقع الرومانية في إفريقيا.",
            descFr: "Un voyage dans le temps pour visiter Timgad et Djémila, parmi les plus beaux sites romains d'Afrique.",
            descEn: "A journey through time to visit Timgad and Djémila, among the most beautiful Roman sites in Africa.",
            destination: "Batna & Setif, Algeria",
            type: "DOMESTIC",
            pricePerPerson: "38000",
            durationDays: 3,
            maxCapacity: 30,
            images: ["https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800"],
            status: "ACTIVE",
            departureDates: [new Date(Date.now() + 45 * 86400000).toISOString()],
            inclusions: ["Entry Tickets", "Expert Guide", "Transport"],
            exclusions: [],
            requirements: ["Valid ID card required", "Age 12+"],
            itinerary: [],
            rating: "4.9",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 4,
            titleAr: "سحر الساحل الشرقي",
            titleFr: "Charm de la Côte Est",
            titleEn: "East Coast Charm",
            descAr: "استكشف جمال عنابة والقالة والحديقة الوطنية المذهلة.",
            descFr: "Explorez la beauté d'Annaba, El Kala et son parc national exceptionnel.",
            descEn: "Explore the beauty of Annaba, El Kala and its exceptional national park.",
            destination: "Annaba & El Kala, Algeria",
            type: "DOMESTIC",
            pricePerPerson: "52000",
            durationDays: 5,
            maxCapacity: 25,
            images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"],
            status: "ACTIVE",
            departureDates: [new Date(Date.now() + 10 * 86400000).toISOString()],
            inclusions: ["Hotel Stay", "Boat Trip", "Breakfast"],
            exclusions: [],
            requirements: ["Swimming gear recommended", "Sun protection"],
            itinerary: [],
            rating: "4.7",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 5,
            titleAr: "قسنطينة: مدينة الجسور",
            titleFr: "Constantine: Ville des Ponts",
            titleEn: "Constantine: City of Bridges",
            descAr: "اكتشف تاريخ وثقافة المدينة المعلقة وجمال جسورها الفريدة.",
            descFr: "Découvrez l'histoire et la culture de la ville suspendue et la beauté de ses ponts uniques.",
            descEn: "Discover the history and culture of the suspended city and the beauty of its unique bridges.",
            destination: "Constantine, Algeria",
            type: "DOMESTIC",
            pricePerPerson: "32000",
            durationDays: 3,
            maxCapacity: 40,
            images: ["https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800"],
            status: "ACTIVE",
            departureDates: [new Date(Date.now() + 20 * 86400000).toISOString()],
            inclusions: ["Guided City Tour", "Lunch at traditional restaurant"],
            exclusions: [],
            requirements: ["Comfortable walking shoes"],
            itinerary: [],
            rating: "4.6",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 6,
            titleAr: "جوهرة الغرب - وهران",
            titleFr: "Le Bijou de l'Ouest - Oran",
            titleEn: "Gem of the West - Oran",
            descAr: "استمتع بالحياة العصرية والتاريخ العريق في عاصمة الراي وهران.",
            descFr: "Profitez de la vie moderne et de l'histoire ancienne dans la capitale du Raï, Oran.",
            descEn: "Enjoy modern life and ancient history in the capital of Raï, Oran.",
            destination: "Oran, Algeria",
            type: "DOMESTIC",
            pricePerPerson: "62000",
            durationDays: 5,
            maxCapacity: 50,
            images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"],
            status: "ACTIVE",
            departureDates: [new Date(Date.now() + 25 * 86400000).toISOString()],
            inclusions: ["Resort Stay", "City Tour", "Beach Access"],
            exclusions: [],
            requirements: ["Valid ID card", "Check-in at 2 PM"],
            itinerary: [],
            rating: "4.8",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    private reservations: Reservation[] = [
        {
            id: 1,
            code: "RHL-2025-00001",
            clientName: "Ahmed Benali",
            clientEmail: "ahmed@email.com",
            clientPhone: "0550001001",
            clientNIN: "123456789012345678",
            numberOfTravelers: 2,
            travelDate: new Date(),
            totalPriceDZD: "250000",
            status: "PENDING",
            packageId: 1,
            notes: "Please call after 5 PM",
            internalNotes: "Client is a repeat customer from 2024",
            idCardImage: "https://images.unsplash.com/photo-1557119221-3968600d33e6?w=600",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    private currentUser: User | null = null;

    constructor() {
        // Check local storage for session
        const savedUser = localStorage.getItem("rihla_user");
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // Auth Methods
    async login(email: string): Promise<User> {
        const user = this.users.find(u => u.email === email);
        if (!user) throw new Error("User not found");
        this.currentUser = user;
        localStorage.setItem("rihla_user", JSON.stringify(user));
        return user;
    }

    async logout(): Promise<void> {
        this.currentUser = null;
        localStorage.removeItem("rihla_user");
    }

    async getCurrentUser(): Promise<User | null> {
        return this.currentUser;
    }

    // Package Methods
    async getPackages(): Promise<TravelPackage[]> {
        return this.packages;
    }

    async getPackage(id: number): Promise<TravelPackage | undefined> {
        return this.packages.find(p => p.id === id);
    }

    async createPackage(data: any): Promise<TravelPackage> {
        const newPkg: TravelPackage = {
            ...data,
            id: Math.max(0, ...this.packages.map(p => p.id)) + 1,
            rating: "0",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.packages.push(newPkg);
        return newPkg;
    }

    // Reservation Methods
    async getReservations(): Promise<(Reservation & { package: TravelPackage })[]> {
        return this.reservations.map(r => ({
            ...r,
            package: this.packages.find(p => p.id === r.packageId)!
        }));
    }

    async createReservation(data: {
        code: string;
        clientName: string;
        clientEmail: string;
        clientPhone: string;
        clientNIN: string;
        numberOfTravelers: number;
        travelDate: string;
        totalPriceDZD: string;
        packageId: number;
        idCardImage?: string;
    }): Promise<Reservation> {
        const newRes: Reservation = {
            id: Math.max(0, ...this.reservations.map(r => r.id)) + 1,
            code: data.code,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            clientNIN: data.clientNIN,
            numberOfTravelers: data.numberOfTravelers,
            travelDate: new Date(data.travelDate),
            totalPriceDZD: data.totalPriceDZD,
            status: "PENDING",
            packageId: data.packageId,
            idCardImage: data.idCardImage,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.reservations.push(newRes);
        return newRes;
    }

    async getReservationByCode(code: string): Promise<(Reservation & { package: TravelPackage }) | undefined> {
        const r = this.reservations.find(r => r.code === code);
        if (!r) return undefined;
        return { ...r, package: this.packages.find(p => p.id === r.packageId)! };
    }

    async cancelReservation(code: string): Promise<void> {
        const idx = this.reservations.findIndex(r => r.code === code);
        if (idx !== -1) {
            this.reservations[idx] = { ...this.reservations[idx], status: "CANCELLED", updatedAt: new Date() };
        }
    }

    async updateReservationStatus(id: number, status: any): Promise<Reservation> {
        const idx = this.reservations.findIndex(r => r.id === id);
        if (idx === -1) throw new Error("Reservation not found");
        this.reservations[idx] = { ...this.reservations[idx], status, updatedAt: new Date() };
        return this.reservations[idx];
    }

    async getDashboardStats() {
        return {
            totalReservations: this.reservations.length,
            pendingReservations: this.reservations.filter(r => r.status === "PENDING").length,
            confirmedReservations: this.reservations.filter(r => r.status === "CONFIRMED").length,
            totalRevenue: this.reservations.filter(r => r.status === "CONFIRMED").reduce((acc, r) => acc + Number(r.totalPriceDZD), 0),
            activePackages: this.packages.filter(p => p.status === "ACTIVE").length,
        };
    }
}

export const mockStorage = new MockStorage();
