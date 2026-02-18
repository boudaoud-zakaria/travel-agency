
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  // === PACKAGES ===
  app.get(api.packages.list.path, async (req, res) => {
    const filters = {
      type: req.query.type as string,
      status: req.query.status as string,
      search: req.query.search as string
    };
    const packages = await storage.getPackages(filters);
    res.json(packages);
  });

  app.get(api.packages.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const pkg = await storage.getPackage(id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json(pkg);
  });

  app.post(api.packages.create.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'CLIENT') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const data = api.packages.create.input.parse(req.body);
      const pkg = await storage.createPackage(data);
      res.status(201).json(pkg);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: e.errors });
      } else {
        throw e;
      }
    }
  });

  app.patch(api.packages.update.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'CLIENT') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = parseInt(req.params.id);
    const pkg = await storage.updatePackage(id, req.body);
    res.json(pkg);
  });

  app.delete(api.packages.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'CLIENT') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = parseInt(req.params.id);
    await storage.deletePackage(id);
    res.sendStatus(200);
  });

  // === RESERVATIONS ===
  app.get(api.reservations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // If client, only show their own reservations (implement logic if we link users to reservations)
    // For now assuming dashboard access is for employees
    if ((req.user as any).role === 'CLIENT') return res.sendStatus(403);

    const filters = {
      status: req.query.status as string,
      code: req.query.code as string,
      packageId: req.query.packageId ? parseInt(req.query.packageId as string) : undefined
    };
    const reservations = await storage.getReservations(filters);
    res.json(reservations);
  });

  app.get(api.reservations.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const reservation = await storage.getReservation(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    res.json(reservation);
  });

  app.post(api.reservations.create.path, async (req, res) => {
    try {
      const data = api.reservations.create.input.parse(req.body);
      const reservation = await storage.createReservation(data);
      res.status(201).json({
        code: reservation.code,
        reservation
      });
    } catch (e) {
       if (e instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: e.errors });
      } else {
        throw e;
      }
    }
  });

  app.patch(api.reservations.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'CLIENT') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = parseInt(req.params.id);
    const { status, note, rejectionReason } = req.body;
    const userId = (req.user as any).id;
    
    const updated = await storage.updateReservationStatus(id, status, note, rejectionReason, userId);
    res.json(updated);
  });

  // === STATS ===
  app.get(api.stats.dashboard.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'CLIENT') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === CONTACT ===
  app.post(api.contact.create.path, async (req, res) => {
    try {
      const data = api.contact.create.input.parse(req.body);
      const msg = await storage.createContactMessage(data);
      res.status(201).json(msg);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: e.errors });
      } else {
        throw e;
      }
    }
  });

  app.get(api.contact.list.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'CLIENT') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const msgs = await storage.getContactMessages();
    res.json(msgs);
  });

  return httpServer;
}
