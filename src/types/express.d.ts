import { Request } from "express";
import { TokenPayload } from "./token-payload.ts";
declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
    }
  }
}
