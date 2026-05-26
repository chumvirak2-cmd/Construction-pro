import * as functions from "firebase-functions";
import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import next from "next";
import type { Request, Response } from "express";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize Firebase Admin
getApp();
getAuth();
getFirestore();

export const nextApp = functions.https.onRequest(
  async (req: Request, res: Response) => {
    // Log request method and path
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    return handle(req, res);
  }
);
